import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"
import { voiceEvents } from "./voiceEvents"

export const usersToVoiceEvents = pgTable(
    "users_to_voice_events",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        voiceEventId: integer("voice_event_id")
            .notNull()
            .references(() => voiceEvents.id),
    },
    (t) => ({
        pk: primaryKey(t.userId, t.voiceEventId),
    }),
)

export const usersToVoiceEventsRelations = relations(
    usersToVoiceEvents,
    ({ one }) => ({
        voiceEvent: one(voiceEvents, {
            fields: [usersToVoiceEvents.voiceEventId],
            references: [voiceEvents.id],
        }),
        user: one(users, {
            fields: [usersToVoiceEvents.userId],
            references: [users.id],
        }),
    }),
)
