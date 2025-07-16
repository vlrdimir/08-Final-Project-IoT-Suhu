"use client";

import {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import mqtt from "mqtt";
import {
  useToggleKipasStore,
  useToggleLampuDalamRumahStore,
  useToggleLightStore,
  useToggleSemuaRuanganStore,
} from "./store/toggle";

type QoSType = 0 | 1 | 2;

interface MQTTContextType {
  client: mqtt.MqttClient | null;
  connectionStatus: string;
  payload: {
    topic?: string;
    message?: string;
    [key: string]: unknown;
  };
  isSubscribed: boolean;
  mqttConnect: (host: string, mqttOption: mqtt.IClientOptions) => void;
  mqttDisconnect: () => void;
  mqttPublish: (context: {
    topic: string;
    qos: QoSType;
    payload: string;
  }) => void;
  mqttSubscribe: (subscription: { topic: string; qos: QoSType }) => void;
  mqttUnSubscribe: (subscription: { topic: string }) => void;
  qosOptions: { label: string; value: QoSType }[];
  temperature: number | null;
  humidity: number | null;
}

const MQTTContext = createContext<MQTTContextType | null>(null);

export const MQTTProvider = ({ children }: { children: ReactNode }) => {
  const { setToggleLight } = useToggleLightStore();
  const { setToggleKipas } = useToggleKipasStore();
  const { setToggleSemuaRuangan } = useToggleSemuaRuanganStore();
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [payload, setPayload] = useState<{ topic?: string; message?: string }>(
    {}
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);

  const mqttConnect = useCallback(
    (host: string, mqttOption: mqtt.IClientOptions) => {
      setConnectionStatus("connecting");
      try {
        setClient(mqtt.connect(host, mqttOption));
      } catch (error) {
        console.error("MQTT Connection Error:", error);
        setConnectionStatus("error");
      }
    },
    []
  );

  useEffect(() => {
    if (client) {
      client.on("connect", () => {
        setConnectionStatus("connected");
        console.log("MQTT Connected!");

        // Auto-subscribe ke topik yang dibutuhkan
        mqttSubscribe({ topic: "suhu", qos: 0 });
        mqttSubscribe({ topic: "kelembaban", qos: 0 });
        mqttSubscribe({ topic: "toggle-light", qos: 0 });
        mqttSubscribe({ topic: "toggle-kipas", qos: 0 });
        mqttSubscribe({ topic: "toggle-kipas-1", qos: 0 });
        mqttSubscribe({ topic: "toggle-lampu-dalam-rumah", qos: 0 });
      });

      client.on("error", (err: Error) => {
        console.error("Connection error: ", err);
        setConnectionStatus("error");
      });

      client.on("reconnect", () => {
        setConnectionStatus("reconnecting");
      });

      client.on("message", (topic: string, message: Buffer) => {
        const msg = message.toString();
        // console.log(`Pesan diterima dari topic ${topic}: ${msg}`);

        const newPayload = { topic: topic, message: msg };
        setPayload(newPayload);

        // Jika topic adalah suhu, update state temperature
        if (topic === "suhu") {
          try {
            const tempValue = parseFloat(msg);
            if (!isNaN(tempValue)) {
              setTemperature(tempValue);
            }
          } catch (err) {
            console.error("Error parsing temperature:", err);
          }
        }

        // Jika topic adalah kelembaban, update state humidity
        if (topic === "kelembaban") {
          try {
            const humidityValue = parseFloat(msg);
            if (!isNaN(humidityValue)) {
              setHumidity(humidityValue);
            }
          } catch (err) {
            console.error("Error parsing humidity:", err);
          }
        }

        if (topic === "toggle-light") {
          const newState = msg === "on";
          console.log(`MQTT received toggle-light: ${newState}`);
          setToggleLight(newState);
        }

        if (topic === "toggle-kipas") {
          const newState = msg === "on";
          console.log(`MQTT received toggle-kipas: ${newState}`);
          setToggleKipas(newState);
        }

        if (topic === "toggle-kipas-1") {
          const newState = msg === "on";
          console.log(`MQTT received toggle-kipas-1: ${newState}`);
          setToggleKipas(newState);
        }

        if (topic === "toggle-lampu-dalam-rumah") {
          const newState = msg === "on";
          const lampuStore = useToggleLampuDalamRumahStore.getState();
          lampuStore.setVisualP3State(newState);
          lampuStore.setToggleLampuDalamRumah(newState);
          console.log(`MQTT received toggle-lampu-dalam-rumah: ${newState}`);
          // setToggleLampuDalamRumah(newState);
        }

        if (topic === "toggle-semua-ruangan") {
          const newState = msg === "on";
          console.log(`MQTT received toggle-semua-ruangan: ${newState}`);
          setToggleSemuaRuangan(newState);
        }
      });

      // Auto connect to broker on component mount
      if (connectionStatus === "disconnected") {
        mqttConnect(`wss://${process.env.NEXT_PUBLIC_MQTT_URL}:8084/mqtt`, {
          clientId: `mqtt_client_${Math.random().toString(16).substring(2, 8)}`,
          clean: true,
          username: "admin",
          password: "admin",
          connectTimeout: 4000,
          reconnectPeriod: 1000,
        });
      }
    }

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [client]);

  const mqttDisconnect = useCallback(() => {
    if (client) {
      console.log(`MQTT disconnected`);
      client.end();
      setClient(null);
      setConnectionStatus("disconnected");
    }
  }, [client]);

  const mqttPublish = useCallback(
    (context: { topic: string; qos: QoSType; payload: string }) => {
      if (client) {
        const { topic, qos, payload } = context;
        client.publish(topic, payload, { qos }, (error) => {
          if (error) {
            console.log("Publish error: ", error);
          }
          console.log(`MQTT published ${payload} to topic ${topic}`);
        });
      }
    },
    [client]
  );

  const mqttSubscribe = useCallback(
    (subscription: { topic: string; qos: QoSType }) => {
      if (client) {
        const { topic, qos } = subscription;
        client.subscribe(topic, { qos }, (error) => {
          if (error) {
            console.log("Subscribe to topics error", error);
            return;
          }
          console.log(`MQTT subscribed to topic ${topic}`);
          setIsSubscribed(true);
        });
      }
    },
    [client]
  );

  const mqttUnSubscribe = useCallback(
    (subscription: { topic: string }) => {
      if (client) {
        const { topic } = subscription;
        client.unsubscribe(topic, (error) => {
          if (error) {
            console.log("Unsubscribe error", error);
            return;
          }
          console.log(`MQTT unsubscribed from topic ${topic}`);
          setIsSubscribed(false);
        });
      }
    },
    [client]
  );

  const qosOptions = useMemo(
    () => [
      {
        label: "0",
        value: 0 as QoSType,
      },
      {
        label: "1",
        value: 1 as QoSType,
      },
      {
        label: "2",
        value: 2 as QoSType,
      },
    ],
    []
  );

  const value = useMemo(
    () => ({
      client,
      connectionStatus,
      payload,
      isSubscribed,
      mqttConnect,
      mqttDisconnect,
      mqttPublish,
      mqttSubscribe,
      mqttUnSubscribe,
      qosOptions,
      temperature,
      humidity,
    }),
    [
      client,
      connectionStatus,
      payload,
      isSubscribed,
      mqttConnect,
      mqttDisconnect,
      mqttPublish,
      mqttSubscribe,
      mqttUnSubscribe,
      qosOptions,
      temperature,
      humidity,
    ]
  );

  return <MQTTContext.Provider value={value}>{children}</MQTTContext.Provider>;
};

export const useMQTT = () => {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error("useMQTT must be used within a MQTTProvider");
  }
  return context;
};
