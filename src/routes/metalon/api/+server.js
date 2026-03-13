import { redis } from "$lib/server/redis.js";


export async function POST({ request, cookies, getClientAddress  }) {
    const data = await request.json();

    const app = "tools-metalon";    
    const session = cookies.get(`${app}-session`) || false;    
    const loginBlocked = cookies.get(`${app}-prevent-login`) || false;

    let superUser = false;


    if(data.operation == "get-order") {
        const {name} = data;
        
        const list = await redis.lrange(`${app}-orders`, 0, -1) || [];
        const order = list.find(e=>e.name == name);

        if(!order) {
            return new Response("not found", {
                status: 404
            });
        }
        
        return new Response(JSON.stringify(order));
    }

    
    if(session) {
        const valid = await redis.get(session);        
        superUser = !!valid;
    } 

    if(!superUser || loginBlocked) {
        return new Response("forbidden", {
            status: 403
        });
    }

    if(data.operation == "save-order") {
        const { order } = data;
        await redis.lpush(`${app}-orders`, JSON.stringify(order));
        return new Response("ok");

    } else if(data.operation == "update-order") {
        const { order } = data;
        await redis.lset(`${app}-orders`, order.index, JSON.stringify(order));
        return new Response("ok");

    } else if(data.operation == "remove-order") {
        const { index } = data;
        await redis.lset(`${app}-orders`, index, "__REMOVE__");
        await redis.lrem(`${app}-orders`, 1, "__REMOVE__");
        return new Response("ok");
    }
}