import { type Lobby } from "../../../src/db/db"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export const LobbyDisplay = ({
    lobby,
    userCount,
}: {
    lobby: Lobby
    userCount?: number
}) => {
    return (
        <Sheet>
            <SheetTrigger>
                <span className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#1E1F22]">
                    {lobby.name}
                    <span className="text-[#959BA3]">({userCount})</span>
                </span>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{lobby.name}</SheetTitle>
                    <SheetDescription>ID: {lobby.discordId}</SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}
