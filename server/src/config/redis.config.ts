import Redis from "ioredis";
import _env from "./env";

let redisClient: Redis;

redisClient = new Redis({
  host: _env.REDIS_HOST,
  port: parseInt(_env.REDIS_PORT),
  password: _env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export default redisClient;