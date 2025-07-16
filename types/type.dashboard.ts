export interface TemperatureReading {
  timestamp: string;
  temperature: number;
  time: string;
}

export interface Sensor {
  id: string;
  name: string;
  location: string;
  currentTemp: number;
  humidity: number; // 0-100%
  lightStatus: boolean; // true = on, false = off
  status: "online" | "offline" | "maintenance" | "error";
  lastUpdate: Date;
  batteryLevel: number; // 0-100
  signalStrength: number; // 0-100
  firmwareVersion: string;
  deviceHealth: "excellent" | "good" | "fair" | "poor";
  uptime: number; // hours
  dataTransmissionRate: number; // messages per hour
  errorCount: number;
  lastMaintenance: Date;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type:
    | "temperature"
    | "humidity"
    | "light"
    | "error"
    | "maintenance"
    | "status"
    | "battery"
    | "signal";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  value?: number;
  details?: string;
}

export interface LogFilter {
  type: string;
  severity: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}
