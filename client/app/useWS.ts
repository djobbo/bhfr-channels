import { useEffect, useState } from "react"

export const useWS = (url?: string) => {
    const [ws, setWS] = useState<WebSocket | null>(null)

    useEffect(() => {
        if (!url) return

        const ws = new WebSocket(url)

        ws.onopen = () => {
            console.log("ws open")
            setWS(ws)
        }

        ws.onclose = () => {
            console.log("ws close")
            setWS(null)
        }

        ws.onerror = (error) => {
            console.error(error)
        }

        return () => {
            ws.close()
        }
    }, [url])

    return ws
}
