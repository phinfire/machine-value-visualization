import dotenv from "dotenv";

dotenv.config();

if (!process.env.WEBSOCKET_PORT) throw new Error("Missing environment variable: WEBSOCKET_PORT");
if (!process.env.MQTT_BROKER_URL) throw new Error("Missing environment variable: MQTT_BROKER_URL");
if (!process.env.MQTT_BROKER_PORT) throw new Error("Missing environment variable: MQTT_BROKER_PORT");
if (!process.env.MQTT_TOPIC) throw new Error("Missing environment variable: MQTT_TOPIC");

export const WEBSOCKET_PORT = parseInt(process.env.WEBSOCKET_PORT, 10);
export const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
export const MQTT_BROKER_PORT = parseInt(process.env.MQTT_BROKER_PORT, 10);
export const MQTT_TOPIC = process.env.MQTT_TOPIC;
export const MOCKED_MESSAGE_INTERVAL_MS = process.env.MOCKED_MESSAGE_INTERVAL_MS
    ? parseInt(process.env.MOCKED_MESSAGE_INTERVAL_MS, 10)
    : 1000;