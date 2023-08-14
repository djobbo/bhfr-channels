import {
    CATEGORY_PREFIX,
    GEN_CHANNEL_PREFIX,
    LOBBY_CHANNEL_PREFIX,
} from "./constants"
import type { GuildChannel, VoiceChannel } from "discord.js"

export type GeneratorChannel = Brand<VoiceChannel, "generator">
export type LobbyChannel = Brand<VoiceChannel, "lobby">

export const isGeneratorChannel = (
    channel: GuildChannel | null,
): channel is GeneratorChannel =>
    !!channel &&
    channel.name.startsWith(GEN_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)

export const isLobbyChannel = (
    channel: GuildChannel | null,
): channel is LobbyChannel =>
    !!channel &&
    channel.name.startsWith(LOBBY_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)
