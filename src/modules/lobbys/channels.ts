import {
    CATEGORY_PREFIX,
    GEN_CHANNEL_PREFIX,
    VOICE_CHANNEL_PREFIX,
} from "./constants"
import type { GuildChannel, VoiceChannel } from "discord.js"

export const isGeneratorChannel = (
    channel: GuildChannel | null,
): channel is VoiceChannel =>
    !!channel &&
    channel.name.startsWith(GEN_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)

export const isVoiceChannel = (
    channel: GuildChannel | null,
): channel is VoiceChannel =>
    !!channel &&
    channel.name.startsWith(VOICE_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)
