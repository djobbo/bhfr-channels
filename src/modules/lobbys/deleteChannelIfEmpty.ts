import { VoiceState, EmbedBuilder, Client } from 'discord.js'
import { getVoiceLogsChannel } from '../../helpers/channels'
import { isVoiceChannel } from './channels'
import { log, newLine } from '../../helpers/log'
import { RedisClientType } from 'redis'
import { REDIS_BRAWLHALLA_LOBBY_PREFIX } from './constants'

export const deleteChannelIfEmpty = async (voiceState: VoiceState, client: Client, redisClient: RedisClientType) => {
    const channel = voiceState.channel

    if (!isVoiceChannel(channel)) return

    const voiceLogsChannel = getVoiceLogsChannel(client)

    log(
        "╭ " +
            `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has left [${channel.name}]`,
    )
    const embed = new EmbedBuilder() //
        .setTitle(channel.name)
        .addFields({
            name: "Événement",
            value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a quitté le salon`,
        })
        .setTimestamp(new Date())

    if (channel.members.size > 0) {
        log(
            "╰ " +
                `  ${channel.members.size}/${channel.userLimit} users in channel`,
        )
        newLine()

        embed //
            .setColor("Orange")
            .setDescription(
                `${channel.members.size}/${channel.userLimit} joueurs restants`,
            )
            .addFields({
                name: "Joueurs",
                value: channel.members
                    .map((member) => `${member.user} (${member.user.id})`)
                    .join("\n"),
            })

        if (!!voiceLogsChannel) {
            voiceLogsChannel.send({ embeds: [embed] })
        }

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle(
                        `${voiceState.member?.user.tag} a quitté le salon`,
                    )
                    .setDescription(`id: ${voiceState.member?.user.id}`)
                    .setTimestamp(new Date()),
            ],
        })

        return
    }

    log("╰ " + `  No users in channel => Deleting channel`)
    newLine()

    await channel.delete()
    await redisClient.del(`${REDIS_BRAWLHALLA_LOBBY_PREFIX}${channel.id}`)

    embed //
        .setDescription(`Aucun joueur restant, suppression du salon`)
        .setColor("Red")

    if (!!voiceLogsChannel) {
        voiceLogsChannel.send({ embeds: [embed] })
    }
}