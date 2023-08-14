import { Client } from "reaccord"
import { DEV_GUILD_ID, DISCORD_CLIENT_ID, DISCORD_TOKEN } from "./env"
import { GatewayIntentBits } from "discord.js"
import { clanCommand } from "./modules/clans"
import { createRedisClient } from "./redis"
import { createWSServer } from "./ws/ws"
import { favoriteCommand } from "./modules/favorite"
import { lobbysModule } from "./modules/lobbys"
import { log, newLine } from "./helpers/log"
import { mockMessageCommand } from "./modules/mock"
import { registerModules } from "./modules/botModule"

const main = async () => {
    const redisClient = await createRedisClient()
    const wss = await createWSServer(8080)

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

    registerModules({ client, redisClient, wss })([lobbysModule])

    client
        .registerCommands([favoriteCommand, mockMessageCommand, clanCommand])
        .connect(() => {
            log(`Logged in as ${client.user?.tag}!`)
            newLine()
        })
}

main()
