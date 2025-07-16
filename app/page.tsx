"use client";

import { MQTTProvider } from "@/hooks/mqtt-context";
import TemperatureMonitor from "../components/temperature-monitor";

export default function Page() {
  return (
    <>
      <MQTTProvider>
        <TemperatureMonitor />
      </MQTTProvider>
    </>
  );
}
