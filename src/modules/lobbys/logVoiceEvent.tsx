import * as WebSocket from "ws"
import { type GeneratorChannel, type LobbyChannel } from "./channels"
import { type User } from "discord.js"
import { type VoiceEvent, db, lobbys, users, voiceEvents } from "../../db/db"

const saveUser = async (user: User) => {
    return db
        .insert(users)
        .values({
            discordId: user.id,
            username: user.username,
            avatar: user.avatar,
        })
        .onConflictDoUpdate({
            target: [users.discordId],
            set: {
                username: user.username,
                avatar: user.avatar,
            },
        })
}

const saveLobby = async (
    lobbyChannel: LobbyChannel,
    generatorChannel: GeneratorChannel | null = null,
    isLobbyDeletion?: boolean,
) => {
    return db
        .insert(lobbys)
        .values({
            discordId: lobbyChannel.id,
            name: lobbyChannel.name,
            generatorChannelId: generatorChannel?.id ?? null,
            createdAt: new Date(),
            deletedAt: isLobbyDeletion ? new Date() : null,
            guildId: lobbyChannel.guild.id,
            room: null,
        })
        .onConflictDoUpdate({
            target: [lobbys.discordId],
            set: {
                name: lobbyChannel.name,
                deletedAt: isLobbyDeletion ? new Date() : null,
            },
        })
}

export const logJoinLobby = async (
    lobbyChannel: LobbyChannel,
    user: User,
    generatorChannel: GeneratorChannel | null = null,
) => {
    await Promise.all([
        saveLobby(lobbyChannel, generatorChannel),
        saveUser(user),
    ])

    const voiceEvent: VoiceEvent = {
        timestamp: new Date(),
        userId: user.id,
        lobbyId: lobbyChannel.id,
        eventType: generatorChannel ? "create_lobby" : "join_lobby",
    }

    if (generatorChannel) {
        console.log(
            `${user.username}[${user.id}] created ${lobbyChannel.name}[${lobbyChannel.id}]`,
        )
        await lobbyChannel.send({
            content: `➕ ${user} a créé ${lobbyChannel}`,
            allowedMentions: { users: [] },
        })
    } else {
        console.log(
            `${user.username}[${user.id}] joined ${lobbyChannel.name}[${lobbyChannel.id}] (${lobbyChannel.members.size}/${lobbyChannel.userLimit})`,
        )
        await lobbyChannel.send({
            content: `⚔️ ${user} a rejoint \`(${lobbyChannel.members.size}/${lobbyChannel.userLimit})\``,
            allowedMentions: { users: [] },
        })
    }
    await logVoiceEvent(voiceEvent)
}

export const logLeaveLobby = async (
    lobbyChannel: LobbyChannel,
    user: User,
    isLobbyDeletion?: boolean,
) => {
    await Promise.all([
        saveLobby(lobbyChannel, null, isLobbyDeletion),
        saveUser(user),
    ])

    const voiceEvent: VoiceEvent = {
        timestamp: new Date(),
        userId: user.id,
        lobbyId: lobbyChannel.id,
        eventType: isLobbyDeletion ? "delete_lobby" : "leave_lobby",
    }

    if (!isLobbyDeletion) {
        console.log(
            `${user.username}[${user.id}] left ${lobbyChannel.name}[${lobbyChannel.id}] (${lobbyChannel.members.size}/${lobbyChannel.userLimit})`,
        )
        await lobbyChannel.send({
            content: `🚪 ${user} a quitté \`(${lobbyChannel.members.size}/${lobbyChannel.userLimit})\``,
            allowedMentions: { users: [] },
        })
    }
    await logVoiceEvent(voiceEvent)
}

const logVoiceEvent = async (
    voiceEvent: VoiceEvent,
    wss?: WebSocket.Server,
) => {
    await db.insert(voiceEvents).values(voiceEvent)

    wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({ type: "voiceEvent", data: voiceEvent }),
            )
        }
    })
}
