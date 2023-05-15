import {
    GatewayIntentBits,
    GuildMember,
    GuildChannel,
} from "discord.js"
import { Client } from "reaccord"
import {
    createSlashCommand,
} from "reaccord/lib/Command"
import { createRedisClient } from './redis'
import { DEV_GUILD_ID, DISCORD_CLIENT_ID, DISCORD_TOKEN, VOICE_CHANNELS_RULES_ROLE_ID } from './env'
import { hasAcceptedVoiceChatRules, isMemberAdmin } from './helpers/userRoles'
import { favoriteCommand } from './modules/favorite'
import { isVoiceChannel } from './modules/lobbys/channels'
import { deleteChannelIfEmpty } from './modules/lobbys/deleteChannelIfEmpty'
import { mockMessageCommand } from './modules/mock'
import { voiceChatRulesEmbed } from './modules/lobbys/RulesEmbed'
import { ACCEPT_VOICE_CHAT_RULES_CUSTOM_ID, logUserJoinedVoiceChannel } from './modules/lobbys/logUserJoinedVoiceChannel'
import { cloneGeneratorChannel } from './modules/lobbys/cloneGeneratorChannel'
import { log, newLine } from './helpers/log'
import { REDIS_BRAWLHALLA_LOBBY_PREFIX } from './modules/lobbys/constants'


createRedisClient().then((redisClient) => {

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
    token: DISCORD_TOKEN,
    clientId: DISCORD_CLIENT_ID,
    devGuildId: DEV_GUILD_ID,
})




const brawlhallaRoomNumberRegex = /^\d{6}$/
const isBrawlhallaRoomNumber = (content: string) =>
    brawlhallaRoomNumberRegex.test(content)


client.listenTo("voiceStateUpdate", async (oldState, newState) => {
    if (oldState.channel?.id === newState.channel?.id) return

    // @ts-expect-error redis client options
    await deleteChannelIfEmpty(oldState, client, redisClient)
    // @ts-expect-error redis client options
    await logUserJoinedVoiceChannel(newState, client, redisClient)
    await cloneGeneratorChannel(newState, client).then(async (channel) => {
        if (!channel) return
        newState.member?.voice.setChannel(channel)
    })
})

client.listenTo("interactionCreate", async (interaction) => {
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
})

client.listenTo("messageCreate", async (message) => {
    if (message.author.bot) return

    if (message.channel.isDMBased()) return

    if (!isVoiceChannel(message.channel as GuildChannel)) return

    if (isBrawlhallaRoomNumber(message.content)) {
        await redisClient.set(`${REDIS_BRAWLHALLA_LOBBY_PREFIX}${message.channel.id}`, message.content)
        message.channel.send(
            `Le numéro de la room est maintenant: \`${message.content}\`.`,
        )
        return
    } else if (message.content === "room") {
        const roomNumber = await redisClient.get(`${REDIS_BRAWLHALLA_LOBBY_PREFIX}${message.channel.id}`)
        if (roomNumber) {
            message.channel.send(`Le numéro de la room est \`${roomNumber}\`.`)
        } else {
            message.channel.send(
                `Le numéro de la room n'est pas encore défini.`,
            )
        }
        return
    }
})


const voiceRulesCommand = createSlashCommand(
    "regles-salons",
    "Règles des salons vocaux",
).exec(async ({}, interaction) => {
    await interaction.reply({
        embeds: [voiceChatRulesEmbed],
        ephemeral: !isMemberAdmin(interaction.member as GuildMember),
    })
})



    client
        .registerCommand(favoriteCommand)
        .registerCommand(voiceRulesCommand)
        .registerCommand(mockMessageCommand)
        .connect(() => {
            log(`Logged in as ${client.user?.tag}!`)
            newLine()
        })
})