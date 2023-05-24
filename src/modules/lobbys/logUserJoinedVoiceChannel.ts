import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js"
import { REDIS_BRAWLHALLA_LOBBY_PREFIX } from "./constants"
import { getVoiceLogsChannel } from "../../helpers/channels"
import { hasAcceptedVoiceChatRules } from "../../helpers/userRoles"
import { isVoiceChannel } from "./channels"
import { log, newLine } from "../../helpers/log"
import { voiceChatRulesEmbed } from "./RulesEmbed"
import type {
    Client,
    MessageActionRowComponentBuilder,
    VoiceState,
} from "discord.js"
import type { RedisClientType } from "redis"

export const ACCEPT_VOICE_CHAT_RULES_CUSTOM_ID = "accept_voice_chat_rules"

export const logUserJoinedVoiceChannel = async (
    voiceState: VoiceState,
    client: Client,
    redisClient: RedisClientType,
) => {
    const channel = voiceState.channel

    if (!isVoiceChannel(channel)) return

    if (!hasAcceptedVoiceChatRules(voiceState.member)) {
        channel.send({
            content: `Salut ${voiceState.member?.user} ! C'est peut être la première fois que tu crées ou rejoins un salon vocal, merci de lire et d'accepter les règles suivantes:`,
            embeds: [voiceChatRulesEmbed],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(ACCEPT_VOICE_CHAT_RULES_CUSTOM_ID)
                        .setEmoji("✅")
                        .setLabel("Accepter")
                        .setStyle(ButtonStyle.Secondary),
                ),
            ],
        })
    }

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor("Green")
                .setTitle(`${voiceState.member?.user.tag} a rejoint le salon`)
                .setDescription(`id: ${voiceState.member?.user.id}`)
                .setTimestamp(new Date()),
        ],
    })

    const roomNumber = await redisClient.get(
        `${REDIS_BRAWLHALLA_LOBBY_PREFIX}${channel.id}`,
    )

    if (!!roomNumber) {
        channel.send(
            `${voiceState.member?.user}, Le numéro de la room est \`${roomNumber}\``,
        )
    }

    log(
        "╭ " +
            `${voiceState.member?.user.tag} (${voiceState.member?.user.id}) has joined [${channel.name}]`,
    )
    log(
        "╰ " +
            `  ${channel.members.size}/${channel.userLimit} users in channel`,
    )
    newLine()

    const voiceLogsChannel = getVoiceLogsChannel(client)

    if (!!voiceLogsChannel) {
        const embed = new EmbedBuilder() //
            .setTitle(channel.name)
            .setDescription(
                `${channel.members.size}/${channel.userLimit} joueurs`,
            )
            .addFields(
                {
                    name: "Événement",
                    value: `${voiceState.member?.user} (${voiceState.member?.user.id}) a rejoint le salon`,
                },
                {
                    name: "Joueurs",
                    value: channel.members
                        .map((member) => `${member.user} (${member.user.id})`)
                        .join("\n"),
                },
            )
            .setTimestamp(new Date())
            .setColor("Green")
        voiceLogsChannel.send({ embeds: [embed] })
    }
}
