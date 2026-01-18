import mqtt from "mqtt";
import { MQTT_BROKER_PORT, MQTT_BROKER_URL, MQTT_TOPIC, WEBSOCKET_PORT } from "./config.js";
import type { MessagePayload } from "./MessagePayload.js";
import { calculateAggregatedSnapshots, isInvalidPayload } from "./helpers.js";
import { startWebSocketServer } from "./websocket.js";
import { startMockBroker } from "./mockBroker.js";

let receivedMessages: MessagePayload[] = [];

const sendCurrentSnapshots = startWebSocketServer(WEBSOCKET_PORT, () => {
    const timeNow = new Date();
    receivedMessages = receivedMessages.filter(msg => (timeNow.getTime() - msg.timestamp.getTime()) <= 60000);
    const r = calculateAggregatedSnapshots(receivedMessages);
    return r;
});

function handleMessage(payload: MessagePayload) {
    if (isInvalidPayload(payload)) {
        console.error("Returning due to invalid payload");
        return;
    }
    receivedMessages.push(payload);
    sendCurrentSnapshots();
}

const mqttClient = mqtt.connect(`${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`, {
    reconnectPeriod: 0,
    connectTimeout: 2000,
});

mqttClient.on("connect", () => {
    console.log(`Connected to MQTT broker at ${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`);
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error(`Failed to subscribe to topic: ${MQTT_TOPIC}`);
        } else {
            console.log(`Successfully subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});

mqttClient.on("error", () => {
    console.warn("Unable to connect to MQTT broker, using mocked broker messages instead");
    startMockBroker(payload => handleMessage(payload));
});

mqttClient.on("message", (_, message) => {
    try {
        const payload: MessagePayload = JSON.parse(message.toString());
        handleMessage(payload);
    } catch (error) {
        console.error("Failed to parse MQTT message:", error);
    }
});