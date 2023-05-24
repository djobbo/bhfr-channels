import { EmbedBuilder } from "discord.js"
import { GEN_CHANNEL_PREFIX, VOICE_CHANNEL_PREFIX } from "./constants"
import { getVoiceLogsChannel } from "../../helpers/channels"
import { isGeneratorChannel } from "./channels"
import { log, newLine } from "../../helpers/log"
import type { Client, VoiceState } from "discord.js"

export const cloneGeneratorChannel = async (
    voiceState: VoiceState,
    client: Client,
) => {
    const channel = voiceState.channel

    if (!isGeneratorChannel(channel)) return null

    if (!channel.parent) return null

    const voiceLogsChannel = getVoiceLogsChannel(client)

    const newChannelName = channel.name.slice(GEN_CHANNEL_PREFIX.length)

    const genChannel = await channel.clone({
        name: `${VOICE_CHANNEL_PREFIX}${newChannelName}`,
        parent: channel.parent,
        position: 999,
    })

    log(
        `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has created [${channel.name}]`,
    )
    newLine()

    if (!!voiceLogsChannel) {
        const embed = new EmbedBuilder() //
            .setTitle(channel.name)
            .addFields({
                name: "Événement",
                value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a créé le salon ${genChannel.name}`,
            })
            .setTimestamp(new Date())
            .setColor("Blue")
        voiceLogsChannel.send({ embeds: [embed] })
    }

    return genChannel
}
