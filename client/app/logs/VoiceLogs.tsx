"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { EventDisplay } from "./EventDisplay"
import { type Lobby, type User, type VoiceEvent } from "../../../src/db/db"
import { LobbyDisplay } from "./LobbyDisplay"
import { useEffect, useState } from "react"
import { useWS } from "../useWS"

export type FullVoiceEvent = VoiceEvent & {
    user: User
    lobby: Lobby
    usersInLobby: {
        user: User
    }[]
}

export const VoiceLogs = ({ events }: { events: FullVoiceEvent[] }) => {
    const [logEvents, setLogEvents] = useState<FullVoiceEvent[]>(events)

    const ws = useWS(
        typeof globalThis.window !== undefined
            ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${
                  window.location.host
              }/ws`
            : undefined,
    )

    useEffect(() => {
        if (!ws) return

        const handleMessages = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            console.log(data)
            if (data.type === "voiceEvent") {
                setLogEvents((currentEvents) => [data.data, ...currentEvents])
            }
        }

        ws.addEventListener("message", handleMessages)

        return () => {
            ws.removeEventListener("message", handleMessages)
        }
    }, [ws])

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
            header: "Lobby",
            cell: ({ row }) => (
                <LobbyDisplay
                    lobby={row.original.lobby}
                    userCount={row.original.usersInLobby.length}
                />
            ),
        },
        {
            header: "Time",
            cell: ({ row }) => (
                <span>{new Date(row.original.timestamp).toISOString()}</span>
            ),
        },
    ]

    return (
        <div className="flex flex-col gap-2 p-8 mx-auto max-w-screen-lg">
            <DataTable columns={columns} data={logEvents} />
        </div>
    )
}
