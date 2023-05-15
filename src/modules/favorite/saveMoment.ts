import { Message, User, EmbedBuilder, Client } from 'discord.js'
import { isTextChannel } from '../../helpers/channels'
import { MOMENTS_CHANNEL_ID } from '../../env'
import { log, newLine } from '../../helpers/log'
import { MOMENT_EMOJI } from '../lobbys/constants'

const getMomentsChannel = (client: Client) => {
    const channel = client.channels.cache.get(MOMENTS_CHANNEL_ID)
    if (!isTextChannel(channel)) return null
    return channel
}

export const saveMoment = async (message: Message, user: User, client: Client) => {
    const channel = getMomentsChannel(client)
    if (!channel) throw new Error("Moments channel not found")

    let hasContent = false

    const embed = new EmbedBuilder()
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL(),
            url: message.url,
        })
        .setDescription(
            `Ajouté le ${Intl.DateTimeFormat("fr").format(message.createdAt)}`,
        )
        .setFooter({
            text: `Ajouté par ${user.username} le ${Intl.DateTimeFormat(
                "fr",
            ).format(new Date())}`,
            iconURL: user.displayAvatarURL(),
        })

    if (message.content) {
        hasContent = true
        embed.addFields({
            name: "Message",
            value: message.content,
            inline: false,
        })
    }

    if (message.attachments.size > 0) {
        hasContent = true
        embed.setImage(message.attachments.first()?.url ?? null)
    }

    if (!hasContent) return

    log(`${MOMENT_EMOJI} Logging moment in ${channel.name}`)
    newLine()

    await channel.send({ embeds: [embed] })
}