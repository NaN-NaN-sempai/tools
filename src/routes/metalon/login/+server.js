import { KV_REST_API_URL, KV_REST_API_TOKEN } from "$env/static/private";
import { json } from '@sveltejs/kit';

import { SUPERUSER, SUPERUSER_PASSWORD } from "$env/static/private";

import { randomUUID } from "node:crypto";
import { redis } from "$lib/server/redis.js";


const app = "tools-metalon";


export async function POST({ request, cookies, getClientAddress  }) {
    const { login, password } = await request.json();

    if(login == "FLUSH"){
        cookies.delete("session");
        return new Response("ok");
    }

    const preventStr = `${app}-prevent-login`;
    const blocked = cookies.get(preventStr);
    if(blocked) {
        return new Response("forbidden", {
            status: 403
        });
    }


    const ip = getClientAddress();

    const loginAttemptsStr = `${app}-login-attempts:${ip}`;
    const attempts = await redis.incr(loginAttemptsStr);
    

    if(attempts == 1) {
        await redis.expire(loginAttemptsStr, 60 * 60);
    }

    if(attempts >= 5) {
        cookies.set(preventStr, "1", {
            path: "/",
            maxAge: 60 * 60 * 12,
            httpOnly: true,
            sameSite: "lax",
            secure: true
        });

        return new Response("forbidden", {
            status: 403
        });
    }
    

    if(login != SUPERUSER || password != SUPERUSER_PASSWORD) {
        return new Response("forbidden", {
            status: 403
        });
    }



    await redis.del(loginAttemptsStr);

    const sessionStr = `${app}-session`;
    const sessionId = `${sessionStr}-${randomUUID()}`;
    
    await redis.set(sessionId, true, {
        ex: 60 * 60 * 24 * 30
    });

    cookies.set(sessionStr, sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: true
    });

    
    return new Response("ok");
};