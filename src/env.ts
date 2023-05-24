import { config as loadEnv } from "dotenv"
loadEnv()

// TODO: validate
export const {
    DISCORD_TOKEN = "",
    ADD_MOMENTS_ROLES_IDS = "",
    MOMENTS_CHANNEL_ID = "",
    VOICE_LOGS_CHANNEL_ID = "",
    VOICE_CHANNELS_RULES_ROLE_ID = "",
    SUPPORT_CHANNEL_ID = "",
    RULES_CHANNEL_ID = "",
    DISCORD_CLIENT_ID = "",
    DEV_GUILD_ID = "",
    BRAWLHALLA_API_KEY = "",
} = process.env

export const addMomentsRoleIds = ADD_MOMENTS_ROLES_IDS.split(",")
