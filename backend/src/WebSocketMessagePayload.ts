export interface WebSocketMessagePayload {
    timestamp: Date;
    machineId: string;
    scrapIndex: number;
    sixtySecondTotal: number,
    sixtySecondAvg: number
}