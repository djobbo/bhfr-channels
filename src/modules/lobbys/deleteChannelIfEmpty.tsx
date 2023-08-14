import { type LobbyChannel } from "./channels"
import { REDIS_BRAWLHALLA_LOBBY_PREFIX } from "./constants"
import { type RedisClient } from "../../redis"
import { logLeaveLobby } from "./logVoiceEvent"
import type { User } from "discord.js"

export const deleteLobbyIfEmpty = async (
    channel: LobbyChannel,
    user: User,
    redisClient: RedisClient,
) => {
    if (channel.members.size > 0) return

    await channel.delete()
    await redisClient.del(`${REDIS_BRAWLHALLA_LOBBY_PREFIX}${channel.id}`)

    await logLeaveLobby(channel, user, true)
}
