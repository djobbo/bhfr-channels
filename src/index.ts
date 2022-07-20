import { EmbedBuilder } from "@discordjs/builders"
import {
    ChannelType,
    Client,
    GatewayIntentBits,
    GuildMember,
    Message,
    PermissionFlagsBits,
    VoiceBasedChannel,
    User,
} from "discord.js"
import { config as loadEnv } from "dotenv"

loadEnv()

const CATEGORY_PREFIX = "🎮 "
const GEN_CHANNEL_PREFIX = "➕ "
const VOICE_CHANNEL_PREFIX = "🎮 "
const MOMENT_EMOJI = '⭐'

const {
    DISCORD_TOKEN = "",
    ADD_MOMENTS_ROLES_IDS = "",
    MOMENTS_CHANNEL_ID = "",
} = process.env

const addMomentsRoleIds = ADD_MOMENTS_ROLES_IDS.split(",")

const isMemberAdmin = (member?: GuildMember): member is GuildMember =>
    !!member?.permissions.has(PermissionFlagsBits.Administrator)

const canAddMoment = (member?: GuildMember): member is GuildMember =>
    !!member && addMomentsRoleIds.some((id) => member.roles.cache.has(id))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
})

const log = (message: string) => {
    console.log(message)
}

const logMoment = async (message: Message, user: User) => {
    const channel = message.guild?.channels.cache.get(MOMENTS_CHANNEL_ID)
    if (!channel || channel.type !== ChannelType.GuildText) return

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
            text: `Ajouté par ${user.username} le ${Intl.DateTimeFormat('fr').format(new Date())}`,
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

    await channel.send({ embeds: [embed] })
}

const isGeneratorChannel = (
    channel: VoiceBasedChannel | null,
): channel is VoiceBasedChannel =>
    !!channel &&
    channel.name.startsWith(GEN_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)

const isVoiceChannel = (
    channel: VoiceBasedChannel | null,
): channel is VoiceBasedChannel =>
    !!channel &&
    channel.name.startsWith(VOICE_CHANNEL_PREFIX) &&
    !!channel.parent?.name.startsWith(CATEGORY_PREFIX)

const deleteChannelIfEmpty = async (channel: VoiceBasedChannel | null) => {
    if (!isVoiceChannel(channel)) return

    if (channel.members.size > 0) return
    log(`Deleting channel ${channel.name} it is empty`)

    await channel.delete()
}

const cloneGeneratorChannel = async (channel: VoiceBasedChannel | null) => {
    if (!isGeneratorChannel(channel)) return null

    if (!channel.parent) return null
    log(`Cloning channel ${channel.name}`)

    const genChannel = await channel.clone({
        name: `${VOICE_CHANNEL_PREFIX}${channel.name.slice(
            GEN_CHANNEL_PREFIX.length,
        )}`,
        parent: channel.parent,
        position: 999,
    })
    log(
        `Cloned channel ${genChannel.name} is at position ${genChannel.position}`,
    )
    return genChannel
}

client.on("voiceStateUpdate", async (oldState, newState) => {
    await deleteChannelIfEmpty(oldState.channel)
    await cloneGeneratorChannel(newState.channel).then(async (channel) => {
        if (!channel) return

        await newState.member?.voice.setChannel(channel)
    })
})

type RawReactionEventData = {
    user_id: string
    message_id: string
    emoji: { name: string; id: null }
    channel_id: string
    guild_id: string
}

const isReactionAddEvent = (
    event: any,
): event is object & { t: "MESSAGE_REACTION_ADD" } =>
    event.t === "MESSAGE_REACTION_ADD"

client.on("raw", async (event: { d: RawReactionEventData; t: string }) => {
    if (!isReactionAddEvent(event)) return

    const { d: data } = event
    const user = await client.users.fetch(data.user_id)

    if (!user || user.bot) return

    const channel = client.channels.cache.get(data.channel_id)
    if (!channel || channel.type !== ChannelType.GuildText) return

    if (channel.messages.cache.has(data.message_id)) return

    const message = await channel.messages.fetch(data.message_id)

    if (!message) return

    log(`${user.tag} reacted with ${data.emoji.name}`)

    if (data.emoji.name !== MOMENT_EMOJI) return

    const member = message.guild?.members.cache.get(user.id)

    if (!isMemberAdmin(member) && !canAddMoment(member)) return

    try {
        await logMoment(message, user)
    }
    catch (e) {
        console.error(e)
    }
})

client.on("ready", () => {
    log(`Logged in as ${client.user?.tag}!`)
})

client.login(DISCORD_TOKEN)
