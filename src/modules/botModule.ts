import { type Client } from "reaccord"
import { type ClientEvents } from "discord.js"
import { type CommandBase } from "reaccord/lib/Command"
import { type RedisClient } from "../redis"
import type WebSocket from "ws"

type GlobalBotDependencies = {
    client: Client
    redisClient: RedisClient
    wss: WebSocket.Server
}

export type BotModule = ({
    client,
    redisClient,
    wss,
}: GlobalBotDependencies) => {
    name: string
    description: string
    version: string
    commands: CommandBase[]
    handlers?: {
        [Event in keyof ClientEvents]?: (
            ...args: ClientEvents[Event]
        ) => void | Promise<void>
    }
}

export const registerModules =
    ({ client, redisClient, wss }: GlobalBotDependencies) =>
    (botModules: BotModule[]) => {
        const registeredModules = botModules.map((botModule) => {
            const { name, description, version, commands, handlers } =
                botModule({ client, redisClient, wss })
            client.registerCommands(commands)
            Object.entries(handlers || {}).forEach(([event, handler]) => {
                client.listenTo(event as any, handler)
            })

            console.log(
                `Registered module ${name} v${version} - ${description}`,
            )
            return { name, description, version }
        })

        return registeredModules
    }
