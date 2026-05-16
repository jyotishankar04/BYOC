import Redis from "ioredis";
import _env from "./env";

const redisClient = _env.REDIS_URL
  ? new Redis(_env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: _env.REDIS_HOST,
      port: parseInt(_env.REDIS_PORT),
      password: _env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

export default redisClient;