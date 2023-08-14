import { type InferModel, relations } from "drizzle-orm"
import { pgTable, serial, varchar } from "drizzle-orm/pg-core"
import { usersToLobbys } from "./usersToLobbys"
import { usersToVoiceEvents } from "./usersToVoiceEvents"

export const users = pgTable("users", {
    id: serial("id").notNull().primaryKey(),
    discordId: varchar("discord_id").notNull().unique(),
    username: varchar("username").notNull(),
    avatar: varchar("avatar"),
})

export type User = InferModel<typeof users, "insert">

export const usersRelations = relations(users, ({ many }) => ({
    lobbys: many(usersToLobbys),
    voiceEvents: many(usersToVoiceEvents),
}))
