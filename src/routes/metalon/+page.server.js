import { redis } from '$lib/server/redis.js';

export const load = async ({url, cookies}) => {

    const value = url.searchParams.get("value");
    const name = url.searchParams.get("name");

    const app = "tools-metalon";    
    const session = cookies.get(`${app}-session`) || false;    
    const loginBlocked = cookies.get(`${app}-prevent-login`) || false;

    let superUser = false;
    
    if(session) {
        const valid = await redis.get(session);        
        superUser = !!valid;
    }

    let dbData = {
        orders: []
    };

    if(superUser) {
        dbData.orders = await redis.lrange(`${app}-orders`, 0, -1) || [];
    }
    
    return { title: "Orçamento Metalon", value, name, superUser, loginBlocked, dbData};
}