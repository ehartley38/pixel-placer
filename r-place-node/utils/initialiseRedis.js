import Redis from "ioredis";

let redis;

export const initialiseRedis = () => {
  redis = new Redis({
    host: process.env.REDIS_CLOUD_HOST,
    password: process.env.REDIS_CLOUD_PASSWORD,
    port: 10160,
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });
};

export const getRedisClient = () => {
  if (!redis) {
    throw new Error("Redis client not initialised");
  }
  return redis;
};
