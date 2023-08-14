import { VoiceLogs } from "./VoiceLogs"
import { db, voiceEvents } from "../../../src/db/db"
import { desc } from "drizzle-orm"

export default async function LogsPage() {
    const logEvents = await db.query.voiceEvents.findMany({
        with: {
            user: true,
            lobby: true,
            usersInLobby: {
                with: {
                    user: true,
                },
            },
        },
        orderBy: desc(voiceEvents.timestamp),
        limit: 50,
    })

    type usersinlobby = (typeof logEvents)[0]["usersInLobby"]

    console.log(logEvents)

    // return <pre>
    //     {JSON.stringify(logEvents, null, 2)}
    // </pre>

    return (
        <>
            <VoiceLogs events={logEvents} />
        </>
    )
}
