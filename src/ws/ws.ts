import WebSocket from "ws"

export const createWSServer = async (port: number) =>
    new Promise<WebSocket.Server>((resolve) => {
        const wss = new WebSocket.Server({ port })
        wss.on("listening", () => resolve(wss))
    })
