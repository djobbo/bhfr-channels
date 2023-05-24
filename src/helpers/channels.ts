import { ChannelType } from "discord.js"
import { VOICE_LOGS_CHANNEL_ID } from "../env"
import type { Channel, Client, TextChannel } from "discord.js"

export const isTextChannel = (channel?: Channel): channel is TextChannel =>
    !!channel && channel.type === ChannelType.GuildText

export const getVoiceLogsChannel = (client: Client) => {
    const channel = client.channels.cache.get(VOICE_LOGS_CHANNEL_ID)
    if (!isTextChannel(channel)) return null
    return channel
}
