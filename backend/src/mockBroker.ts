import { MOCKED_MESSAGE_INTERVAL_MS } from "./config.js";
import type { MessagePayload } from "./MessagePayload.js";

const MACHINE_IDS = ["A1", "A2", "A3", "B1", "B2"];

export function startMockBroker(onMessage: (message: MessagePayload) => void) {
    setInterval(() => {
        const machineId = MACHINE_IDS[Math.floor(Math.random() * MACHINE_IDS.length)]!;
        onMessage({
            machineId,
            scrapIndex: Math.floor(Math.random() * 4) + 1,
            value: Math.floor(Math.random() * 10) + 1,
            timestamp: new Date(),
        });
    }, MOCKED_MESSAGE_INTERVAL_MS);
}
