import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core"
import { lobbys } from "./lobbys"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const usersToLobbys = pgTable(
    "users_to_lobbys",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        lobbyId: integer("lobby_id")
            .notNull()
            .references(() => lobbys.id),
    },
    (t) => ({
        pk: primaryKey(t.userId, t.lobbyId),
    }),
)

export const usersToLobbysRelations = relations(usersToLobbys, ({ one }) => ({
    lobby: one(lobbys, {
        fields: [usersToLobbys.lobbyId],
        references: [lobbys.id],
    }),
    user: one(users, {
        fields: [usersToLobbys.userId],
        references: [users.id],
    }),
}))
