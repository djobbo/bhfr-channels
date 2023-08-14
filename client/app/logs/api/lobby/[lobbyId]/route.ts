import { type NextApiRequest, type NextApiResponse } from "next"
import { db, lobbys } from "../../../../../../src/db/db"
import { eq } from "drizzle-orm"
import z from "zod"

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const lobbyId = z.string().parse(req.query.lobbyId)
        const lobby = await db.query.lobbys.findFirst({
            with: {
                users: true,
            },
            where: eq(lobbys.discordId, lobbyId),
        })

        if (!lobby) {
            return res.status(404).json({ message: "Lobby not found" })
        }

        res.status(200).json(lobby)
    } catch {
        res.status(500).json({ message: "Internal Server Error" })
    }
}
