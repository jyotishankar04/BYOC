import { createClient } from "redis";
import env from "@/config/env";
import logger from "@/core/logger";

const cacheClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
  },
  password: env.REDIS_PASSWORD || undefined,
});

cacheClient.on("error", (err) => logger.error({ err }, "Cache client error"));

export default cacheClient;
