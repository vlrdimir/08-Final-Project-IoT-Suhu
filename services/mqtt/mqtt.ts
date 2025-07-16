import mqtt, { MqttClient } from "mqtt";

export async function getMqttClient(): Promise<MqttClient> {
  let client: MqttClient | null = null;

  if (!client) {
    client = mqtt.connect(`mqtts://${process.env.NEXT_PUBLIC_MQTT_URL}:8883`, {
      username: process.env.NEXT_PUBLIC_MQTT_USER,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      reconnectPeriod: 1000,
    });
  }

  // pastikan sudah tersambung sebelum melanjutkan
  if (client.connected) return client;
  return new Promise((resolve, reject) => {
    client!.once("connect", () => resolve(client!));
    client!.once("error", reject);
  });
}
