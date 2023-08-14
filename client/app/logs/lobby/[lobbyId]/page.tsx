"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { EventDisplay } from "../../EventDisplay"
import {
    type User,
    type VoiceEvent,
    db,
    lobbys,
    voiceEvents,
} from "../../../../../src/db/db"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

const paramsSchema = z.object({
    lobbyId: z.string(),
})

type FullVoiceEvent = VoiceEvent & {
    user: User
    usersInLobby: {
        user: User
    }[]
}

export default async function LobbyPage({
    params,
}: {
    params: { lobbyId: string }
}) {
    const { lobbyId } = paramsSchema.parse(params)

    const lobby = await db.query.lobbys.findFirst({
        with: {
            users: true,
        },
        where: eq(lobbys.discordId, lobbyId),
    })

    const lobbyHistory = await db.query.voiceEvents.findMany({
        where: eq(voiceEvents.lobbyId, lobbyId),
        orderBy: desc(voiceEvents.timestamp),
        limit: 50,
        with: {
            user: true,
            usersInLobby: {
                with: {
                    user: true,
                },
            },
        },
    })

    if (!lobby) {
        return <div>Not found</div>
    }

    const columns: ColumnDef<FullVoiceEvent>[] = [
        {
            header: "User",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage
                            src={row.original.user.avatar || undefined}
                        />
                        <AvatarFallback className="uppercase">
                            {row.original.user.username[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">
                            {row.original.user.username}
                        </span>
                        <span className="text-xs text-gray-400">
                            {row.original.user.discordId}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: "Event",
            cell: ({ row }) => {
                return <EventDisplay eventType={row.original.eventType} />
            },
        },
        {
            header: "Time",
            cell: ({ row }) => (
                <span>{new Date(row.original.timestamp).toISOString()}</span>
            ),
        },
    ]

    return (
        <div>
            <h1>Lobby: {lobby.name}</h1>
            <div className="flex flex-col gap-2 p-8 mx-auto max-w-screen-lg">
                <DataTable columns={columns} data={lobbyHistory} />
            </div>
        </div>
    )
}
