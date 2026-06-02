import redisClient from "../config/redis.ts";

const BLOCKLIST_PREFIX = "jwt:blocklist:";

export const blockToken = async (
  token: string,
  expiresIn: number
): Promise<void> => {
  await redisClient.set(`${BLOCKLIST_PREFIX}${token}`, "1", {
    EX: expiresIn, 
  });
};

export const isTokenBlocked = async (token: string): Promise<boolean> => {
  const result = await redisClient.get(`${BLOCKLIST_PREFIX}${token}`);
  return result !== null;
};