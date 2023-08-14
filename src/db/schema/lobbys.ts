import { type InferModel, relations } from "drizzle-orm"
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"
import { usersToLobbys } from "./usersToLobbys"

export const lobbys = pgTable("lobbys", {
    id: serial("id").notNull().primaryKey(),
    discordId: varchar("discord_id").notNull().unique(),
    guildId: varchar("guild_id").notNull(),
    name: varchar("name").notNull(),
    room: varchar("room"),
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    generatorChannelId: varchar("generator_channel_id"),
})

export type Lobby = InferModel<typeof lobbys, "insert">

export const lobbysRelations = relations(lobbys, ({ many }) => ({
    users: many(usersToLobbys),
}))
