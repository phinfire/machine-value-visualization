import type { WebSocketMessagePayload } from "./WebSocketMessagePayload.js";
import type { MessagePayload } from "./MessagePayload.js";

export function calculateAggregatedSnapshots(filteredPayloads: MessagePayload[]) {
    const totals = new Map<string, Map<number, number>>();
    const messageCounts = new Map<string, Map<number, number>>();
    for (const payload of filteredPayloads) {
        if (!totals.has(payload.machineId)) {
            totals.set(payload.machineId, new Map<number, number>());
            messageCounts.set(payload.machineId, new Map<number, number>());
        }
        const machineTotals = totals.get(payload.machineId)!;
        const machineCounts = messageCounts.get(payload.machineId)!;
        machineTotals.set(payload.scrapIndex, (machineTotals.get(payload.scrapIndex) || 0) + payload.value);
        machineCounts.set(payload.scrapIndex, (machineCounts.get(payload.scrapIndex) || 0) + 1);
    }
    const snapshots = [];
    for (const [machineId, scrapMap] of totals.entries()) {
        for (const [scrapIndex, total] of scrapMap.entries()) {
            const count = messageCounts.get(machineId)!.get(scrapIndex)!;
            const avg = total / count;
            const snapshot: WebSocketMessagePayload = {
                timestamp: new Date(),
                machineId,
                scrapIndex,
                sixtySecondTotal: total,
                sixtySecondAvg: avg
            };
            snapshots.push(snapshot);
        }
    }
    return snapshots;
}

export function isInvalidPayload(payload: any): boolean {
    if (typeof payload.machineId !== "string") {
        console.error("Invalid machineId in payload!", payload);
        return true;
    }
    if (typeof payload.scrapIndex !== "number" || isNaN(payload.scrapIndex)) {
        console.error("Invalid scrapIndex in payload!", payload);
        return true;
    }
    if (typeof payload.value !== "number") {
        console.error("Invalid value in payload!", payload);
        return true;
    }
    if (isNaN(new Date(payload.timestamp).getTime())) {
        console.error("Invalid timestamp in payload!", payload);
        return true;
    }
    return false;
}