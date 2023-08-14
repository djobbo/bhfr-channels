import { GEN_CHANNEL_PREFIX, LOBBY_CHANNEL_PREFIX } from "./constants"
import { type GeneratorChannel, isLobbyChannel } from "./channels"
import { logJoinLobby } from "./logVoiceEvent"
import type { User, VoiceChannel } from "discord.js"

export const cloneGeneratorChannel = async (
    generatorChannel: GeneratorChannel,
    user: User,
) => {
    if (!generatorChannel.parent) return null

    const newChannelName = generatorChannel.name.slice(
        GEN_CHANNEL_PREFIX.length,
    )

    const lobbyChannel: VoiceChannel = await generatorChannel.clone({
        name: `${LOBBY_CHANNEL_PREFIX}${newChannelName}`,
        parent: generatorChannel.parent,
        position: 999,
    })

    if (!isLobbyChannel(lobbyChannel)) {
        throw new Error("Cloned channel is not a lobby channel")
    }

    logJoinLobby(lobbyChannel, user, generatorChannel)

    return lobbyChannel
}
