import WebSocket, { WebSocketServer } from "ws";
import type { WebSocketMessagePayload } from "./WebSocketMessagePayload.js";

export function startWebSocketServer(port: number,
    snapShotSupplier: () => WebSocketMessagePayload[]
) {
    const wss = new WebSocketServer({ port });
    const clients = new Set<WebSocket>();

    console.log(`WebSocket server is running on port ${port}`);
    function triggerBroadcast() {
        const snapshots = snapShotSupplier();
        const message = JSON.stringify({ snapshots });
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
    wss.on("connection", (ws: WebSocket) => {
        clients.add(ws);
        triggerBroadcast();
        ws.on("close", () => {
            clients.delete(ws);
        });
        ws.on("error", (err) => {
            console.error("WebSocket error:", err);
            clients.delete(ws);
        });
    });
    return triggerBroadcast;
}