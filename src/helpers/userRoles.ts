import { PermissionFlagsBits } from "discord.js"
import { VOICE_CHANNELS_RULES_ROLE_ID } from "../env"
import type { GuildMember } from "discord.js"

export const isMemberAdmin = (member?: GuildMember): member is GuildMember =>
    !!member?.permissions.has(PermissionFlagsBits.Administrator)

export const hasAcceptedVoiceChatRules = (member: GuildMember | null) =>
    !VOICE_CHANNELS_RULES_ROLE_ID ||
    !member ||
    member.roles.cache.has(VOICE_CHANNELS_RULES_ROLE_ID)
