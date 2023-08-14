import { ACCEPT_VOICE_CHAT_RULES_CUSTOM_ID } from "./logUserJoinedVoiceChannel"
import { type BotModule } from "../botModule"
import {
    type GuildChannel,
    type GuildMember,
    type Interaction,
    type Message,
    type VoiceBasedChannel,
    type VoiceState,
} from "discord.js"
import { REDIS_BRAWLHALLA_LOBBY_PREFIX } from "./constants"
import { type RedisClient } from "../../redis"
import { VOICE_CHANNELS_RULES_ROLE_ID } from "../../env"
import { cloneGeneratorChannel } from "./cloneGeneratorChannel"
import { createSlashCommand } from "reaccord"
import { deleteLobbyIfEmpty } from "./deleteChannelIfEmpty"
import {
    hasAcceptedVoiceChatRules,
    isMemberAdmin,
} from "../../helpers/userRoles"
import { isGeneratorChannel, isLobbyChannel } from "./channels"
import { logJoinLobby, logLeaveLobby } from "./logVoiceEvent"
import { voiceChatRulesEmbed } from "./RulesEmbed"

const brawlhallaRoomNumberRegex = /^\d{6}$/
const isBrawlhallaRoomNumber = (content: string) =>
    brawlhallaRoomNumberRegex.test(content)

const handleUserJoinedGeneratorChannel = async (
    channel: VoiceBasedChannel | null,
    member: GuildMember,
) => {
    if (!isGeneratorChannel(channel)) return

    const lobbyChannel = await cloneGeneratorChannel(channel, member.user)

    if (!lobbyChannel) return
    member.voice.setChannel(lobbyChannel)
}

const handleUserJoinedLobbyChannel = async (
    channel: VoiceBasedChannel | null,
    member: GuildMember,
    redisClient: RedisClient,
) => {
    if (!isLobbyChannel(channel)) return

    const roomNumber = await redisClient.get(
        `${REDIS_BRAWLHALLA_LOBBY_PREFIX}${channel.id}`,
    )

    if (!!roomNumber) {
        channel.send(
            `${member.user}, Le numéro de la room est \`${roomNumber}\``,
        )
    }

    logJoinLobby(channel, member.user)
}

const handleUserLeftLobbyChannel = async (
    channel: VoiceBasedChannel | null,
    member: GuildMember,
    redisClient: RedisClient,
) => {
    if (!isLobbyChannel(channel)) return

    await logLeaveLobby(channel, member.user, false)
    await deleteLobbyIfEmpty(channel, member.user, redisClient)
}

export const lobbysModule: BotModule = ({ client, redisClient }) => {
    const handleVoiceStateUpdate = async (
        oldState: VoiceState,
        newState: VoiceState,
    ) => {
        if (oldState.channel?.id === newState.channel?.id) return

        const member = newState.member || oldState.member

        if (!member) return

        handleUserJoinedGeneratorChannel(newState.channel, member)
        handleUserJoinedLobbyChannel(newState.channel, member, redisClient)
        handleUserLeftLobbyChannel(oldState.channel, member, redisClient)
    }

    const handleInteractionCreate = async (interaction: Interaction) => {
        if (!interaction.isButton()) return

        if (interaction.customId !== ACCEPT_VOICE_CHAT_RULES_CUSTOM_ID) return
        const member = interaction.member as GuildMember

        if (!member) return

        if (!interaction.message.mentions.has(member.user)) {
            interaction.reply({
                content: `Vous n'êtes pas concerné par ce message.`,
                ephemeral: true,
            })
            return
        }

        if (hasAcceptedVoiceChatRules(member)) return

        await member.roles.add(VOICE_CHANNELS_RULES_ROLE_ID)

        await interaction.reply({
            content: `Merci ${member.user} ! Bon jeu !`,
            ephemeral: true,
        })

        interaction.message.delete()
    }

    const handleMessageCreate = async (message: Message) => {
        if (message.author.bot) return

        if (message.channel.isDMBased()) return

        if (!isLobbyChannel(message.channel as GuildChannel)) return

        if (isBrawlhallaRoomNumber(message.content)) {
            await redisClient.set(
                `${REDIS_BRAWLHALLA_LOBBY_PREFIX}${message.channel.id}`,
                message.content,
            )
            message.channel.send(
                `Le numéro de la room est maintenant: \`${message.content}\`.`,
            )
            return
        } else if (message.content === "room") {
            const roomNumber = await redisClient.get(
                `${REDIS_BRAWLHALLA_LOBBY_PREFIX}${message.channel.id}`,
            )
            if (roomNumber) {
                message.channel.send(
                    `Le numéro de la room est \`${roomNumber}\`.`,
                )
            } else {
                message.channel.send(
                    `Le numéro de la room n'est pas encore défini.`,
                )
            }
            return
        }
    }

    const voiceRulesCommand = createSlashCommand(
        "regles-salons",
        "Règles des salons vocaux",
    ).exec(async ({}, interaction) => {
        await interaction.reply({
            embeds: [voiceChatRulesEmbed],
            ephemeral: !isMemberAdmin(interaction.member as GuildMember),
        })
    })

    return {
        name: "lobbys",
        description: "Gestion des salons vocaux",
        version: "0.0.1",
        commands: [voiceRulesCommand],
        handlers: {
            voiceStateUpdate: handleVoiceStateUpdate,
            interactionCreate: handleInteractionCreate,
            messageCreate: handleMessageCreate,
        },
    }
}
