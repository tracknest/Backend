import { createClient } from "redis";
import logger from "./logger.ts";

const redisClient = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error("Redis: too many reconnect attempts — giving up");
        return new Error("Redis reconnect limit reached");
      }
      // Exponential backoff: 200ms, 400ms, 800ms … capped at 5s
      const delay = Math.min(200 * 2 ** retries, 5000);
      logger.warn(`Redis: reconnecting in ${delay}ms (attempt ${retries + 1})`);
      return delay;
    },
  },
});

redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("ready", () => logger.info("Redis ready"));
redisClient.on("error", (err) => logger.error("Redis error: " + err));
redisClient.on("reconnecting", () => logger.warn("Redis reconnecting..."));

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export default redisClient;
