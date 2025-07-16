import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Lightbulb,
  Thermometer,
  Wifi,
  Fan,
  Power,
  CircuitBoard,
} from "lucide-react";
import {
  useToggleLampuDalamRumahStore,
  useToggleLightStore,
  useToggleSemuaRuanganStore,
} from "@/hooks/store/toggle";
import { useToggleKipasStore } from "@/hooks/store/toggle";
import { useMQTT } from "@/hooks/mqtt-context";

interface CurrentSensor {
  name: string;
  currentTemp: number;
  humidity: number;
  lightStatus: boolean;
}

function TemperatureReading({
  currentSensor,
  tempStatus,
  mqttStatus = false,
}: {
  currentSensor: CurrentSensor;
  tempStatus: {
    status: string;
    color: string;
    bg: string;
  };
  mqttStatus?: boolean;
}) {
  const { setToggleLight, toggleLight } = useToggleLightStore();
  const { setToggleKipas, toggleKipas } = useToggleKipasStore();
  const { visualP3State } = useToggleLampuDalamRumahStore();
  const { toggleSemuaRuangan } = useToggleSemuaRuanganStore();

  const { mqttPublish } = useMQTT();
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Current Reading
          {mqttStatus && (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSensor && (
          <div className="space-y-3">
            {/* Temperature Display */}
            <div className={`p-4 rounded-lg ${tempStatus?.bg}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${tempStatus?.color}`}>
                  {currentSensor.currentTemp}°C
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {currentSensor.name} {mqttStatus ? "(MQTT)" : ""}
                </div>
              </div>
            </div>

            {/* Humidity Display */}
            <div className="p-4 rounded-lg temp-low">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {currentSensor.humidity}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Kelembaban
                </div>
              </div>
            </div>

            {/* Control Panel - Grid Layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Light Control */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                  toggleLight
                    ? "bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => {
                  const newState = !toggleLight;
                  setToggleLight(newState);
                  mqttPublish({
                    topic: "toggle-light",
                    qos: 0,
                    payload: newState ? "on" : "off",
                  });
                  console.log("toggleLight", newState, "sent topic to arduino");
                }}
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-sm font-medium mb-2 text-center">
                    Port 2
                  </div>
                  <div className="relative">
                    <Power
                      className={`h-10 w-10 ${
                        toggleLight
                          ? "text-yellow-500 dark:text-yellow-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {toggleLight && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div
                    className={`mt-2 font-medium text-center px-3 py-1 rounded-full text-sm ${
                      toggleLight
                        ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {toggleLight ? "Nyala" : "Mati"}
                  </div>
                </div>
              </div>

              {/* Kipas Control */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                  toggleKipas
                    ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => {
                  const newState = !toggleKipas;
                  setToggleKipas(newState);
                  mqttPublish({
                    topic: "toggle-kipas",
                    qos: 0,
                    payload: newState ? "on" : "off",
                  });
                  console.log("toggleKipas", newState, "sent topic to arduino");
                }}
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-sm font-medium mb-2 text-center">
                    Kipas Utama (P1)
                  </div>
                  <div className="relative">
                    <Fan
                      className={`h-10 w-10 ${
                        toggleKipas
                          ? "text-blue-500 dark:text-blue-400 animate-spin"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      style={{ animationDuration: toggleKipas ? "3s" : "0s" }}
                    />
                    {toggleKipas && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div
                    className={`mt-2 font-medium text-center px-3 py-1 rounded-full text-sm ${
                      toggleKipas
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {toggleKipas ? "Nyala" : "Mati"}
                  </div>
                </div>
              </div>

              {/* Dalam Rumah Light Control P3 */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                  visualP3State
                    ? "bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-300 dark:border-yellow-700"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => {
                  const lampuStore = useToggleLampuDalamRumahStore.getState();
                  const { toggleLampuDalamRumahIndependent, visualP3State } =
                    lampuStore;

                  const newState = !visualP3State;
                  toggleLampuDalamRumahIndependent(newState, mqttPublish);

                  console.log(
                    "toggleLampuDalamRumah",
                    newState,
                    "sent topic to arduino"
                  );
                }}
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-sm font-medium mb-2 text-center">
                    Dalam Rumah (P3)
                  </div>
                  <div className="relative">
                    <Lightbulb
                      className={`h-10 w-10 ${
                        visualP3State
                          ? "text-yellow-500 dark:text-yellow-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {visualP3State && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div
                    className={`mt-2 font-medium text-center px-3 py-1 rounded-full text-sm ${
                      visualP3State
                        ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {visualP3State ? "Nyala" : "Mati"}
                  </div>
                </div>
              </div>

              {/* Mati / nyala semua port P4 */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                  toggleSemuaRuangan
                    ? "bg-purple-100 dark:bg-purple-900 border-2 border-purple-300 dark:border-purple-700"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => {
                  const { toggleSemuaRuanganWithP3 } =
                    useToggleSemuaRuanganStore.getState();
                  const lampuStore = useToggleLampuDalamRumahStore.getState();

                  const newState = !toggleSemuaRuangan;
                  toggleSemuaRuanganWithP3(newState, mqttPublish);

                  if (!newState) {
                    lampuStore.setVisualP3State(false);
                  } else {
                    lampuStore.setVisualP3State(true);
                  }

                  console.log(
                    "toggleSemuaRuangan",
                    newState,
                    "sent topic to arduino"
                  );
                }}
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-sm font-medium mb-2 text-center">
                    Semua Port (P4)
                  </div>
                  <div className="relative">
                    <CircuitBoard
                      className={`h-10 w-10 ${
                        toggleSemuaRuangan
                          ? "text-purple-500 dark:text-purple-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {toggleSemuaRuangan && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div
                    className={`mt-2 font-medium text-center px-3 py-1 rounded-full text-sm ${
                      toggleSemuaRuangan
                        ? "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {toggleSemuaRuangan ? "Nyala" : "Mati"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TemperatureReading;
