import { REDIS_URL } from "./env"
import { createClient } from "redis"

export const createRedisClient = async () => {
    const redisClient = createClient({
        url: REDIS_URL ?? "",
    })

    redisClient.on("error", (err) => console.error("Redis Client Error", err))
    await redisClient.connect()
    return redisClient
}

export type RedisClient = Awaited<ReturnType<typeof createRedisClient>>
