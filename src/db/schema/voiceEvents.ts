import { type InferModel, relations } from "drizzle-orm"
import { lobbys } from "./lobbys"
import {
    pgEnum,
    pgTable,
    serial,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { usersToVoiceEvents } from "./usersToVoiceEvents"

export const eventTypeEnum = pgEnum("event_type", [
    "create_lobby",
    "delete_lobby",
    "join_lobby",
    "leave_lobby",
])

export const voiceEvents = pgTable("voice_events", {
    id: serial("id").notNull().primaryKey(),
    timestamp: timestamp("timestamp").notNull(),
    userId: varchar("user_id")
        .notNull()
        .references(() => users.discordId),
    lobbyId: varchar("lobby_id")
        .notNull()
        .references(() => lobbys.discordId),
    eventType: eventTypeEnum("event_type").notNull(),
})

export type VoiceEvent = InferModel<typeof voiceEvents, "insert">

export const voiceEventsRelations = relations(voiceEvents, ({ one, many }) => ({
    user: one(users, {
        fields: [voiceEvents.userId],
        references: [users.discordId],
    }),
    lobby: one(lobbys, {
        fields: [voiceEvents.lobbyId],
        references: [lobbys.discordId],
    }),
    usersInLobby: many(usersToVoiceEvents),
}))
