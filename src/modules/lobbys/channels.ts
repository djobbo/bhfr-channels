import { GuildChannel, VoiceChannel } from 'discord.js'
import { GEN_CHANNEL_PREFIX, CATEGORY_PREFIX, VOICE_CHANNEL_PREFIX } from './constants'



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