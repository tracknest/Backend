import redisClient from "../config/redis.js";
const BLOCKLIST_PREFIX = "jwt:blocklist:";
export const blockToken = async (token, expiresIn) => {
    await redisClient.set(`${BLOCKLIST_PREFIX}${token}`, "1", {
        EX: expiresIn,
    });
};
export const isTokenBlocked = async (token) => {
    const result = await redisClient.get(`${BLOCKLIST_PREFIX}${token}`);
    return result !== null;
};
//# sourceMappingURL=tokenBlocklist.js.map