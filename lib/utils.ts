import { LogEntry, LogFilter } from "@/types/type.dashboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fungsi utilitas untuk memproses teks sebelum dikirim ke TTS
export const processTTSText = (text: string): string => {
  // Batasi panjang teks untuk TTS (maksimum 300 karakter)
  if (text.length > 300) {
    // Cari kalimat terakhir yang lengkap sebelum batas 300 karakter
    const truncatedText = text.substring(0, 300);
    // Cari titik terakhir untuk memotong di akhir kalimat
    const lastSentenceEnd = truncatedText.lastIndexOf(".");

    // Jika ada titik, potong sampai titik tersebut, jika tidak gunakan 300 karakter
    if (lastSentenceEnd > 0) {
      return truncatedText.substring(0, lastSentenceEnd + 1);
    }
    return truncatedText + "...";
  }

  return text;
};

export const getBatteryStatus = (level: number) => {
  if (level > 60)
    return { color: "text-green-600", bg: "bg-green-100", icon: "🔋" };
  if (level > 30)
    return { color: "text-yellow-600", bg: "bg-yellow-100", icon: "🪫" };
  return { color: "text-red-600", bg: "bg-red-100", icon: "🔴" };
};

export const getSignalStatus = (strength: number) => {
  if (strength > 80)
    return { color: "text-green-600", bars: "📶", quality: "Excellent" };
  if (strength > 60)
    return { color: "text-yellow-600", bars: "📶", quality: "Good" };
  if (strength > 40)
    return { color: "text-orange-600", bars: "📶", quality: "Fair" };
  return { color: "text-red-600", bars: "📶", quality: "Poor" };
};

export const getDeviceHealthColor = (health: string) => {
  switch (health) {
    case "excellent":
      return "text-green-600";
    case "good":
      return "text-blue-600";
    case "fair":
      return "text-yellow-600";
    case "poor":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "online":
      return "default";
    case "offline":
      return "secondary";
    case "maintenance":
      return "outline";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
};

export const getLogTypeIcon = (type: LogEntry["type"]) => {
  switch (type) {
    case "temperature":
      return "🌡️";
    case "error":
      return "❌";
    case "maintenance":
      return "🔧";
    case "status":
      return "📊";
    case "battery":
      return "🔋";
    case "signal":
      return "📡";
    default:
      return "📝";
  }
};

export const getSeverityColor = (severity: LogEntry["severity"]) => {
  switch (severity) {
    case "info":
      return "text-blue-600 bg-blue-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "error":
      return "text-red-600 bg-red-50";
    case "critical":
      return "text-red-800 bg-red-100";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const filterLogs = (
  logs: LogEntry[],
  logFilter: LogFilter
): LogEntry[] => {
  return logs.filter((log) => {
    // Type filter
    if (logFilter.type !== "all" && log.type !== logFilter.type) return false;

    // Severity filter
    if (logFilter.severity !== "all" && log.severity !== logFilter.severity)
      return false;

    // Date range filter
    if (logFilter.dateFrom && log.timestamp < new Date(logFilter.dateFrom))
      return false;
    if (
      logFilter.dateTo &&
      log.timestamp > new Date(logFilter.dateTo + "T23:59:59")
    )
      return false;

    // Search term filter
    if (
      logFilter.searchTerm &&
      !log.message.toLowerCase().includes(logFilter.searchTerm.toLowerCase())
    )
      return false;

    return true;
  });
};

export const generateLogHistory = (sensorId: string): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = new Date();

  // Generate sample log entries for the past 7 days
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(
      now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
    );
    const logTypes = [
      "temperature",
      "error",
      "maintenance",
      "status",
      "battery",
      "signal",
    ];
    const type = logTypes[
      Math.floor(Math.random() * logTypes.length)
    ] as LogEntry["type"];

    let severity: LogEntry["severity"] = "info";
    let message = "";
    let value: number | undefined;
    let details: string | undefined;

    switch (type) {
      case "temperature":
        severity = "info";
        value = Math.round((20 + Math.random() * 10) * 10) / 10;
        message = `Temperature reading: ${value}°C`;
        details = "Normal temperature measurement";
        break;
      case "error":
        severity = Math.random() > 0.7 ? "critical" : "error";
        const errors = [
          "Sensor calibration drift detected",
          "Communication timeout",
          "Invalid temperature reading",
          "Power supply fluctuation",
          "Memory allocation error",
        ];
        message = errors[Math.floor(Math.random() * errors.length)];
        details = "System error occurred during operation";
        break;
      case "maintenance":
        severity = "warning";
        const maintenance = [
          "Scheduled calibration completed",
          "Battery replacement required",
          "Firmware update available",
          "Sensor cleaning performed",
        ];
        message = maintenance[Math.floor(Math.random() * maintenance.length)];
        details = "Maintenance activity logged";
        break;
      case "status":
        severity = "info";
        const statuses = [
          "Device online",
          "Device offline",
          "Reconnected",
          "Sleep mode activated",
        ];
        message = statuses[Math.floor(Math.random() * statuses.length)];
        details = "Device status change";
        break;
      case "battery":
        severity = Math.random() > 0.8 ? "warning" : "info";
        value = Math.round(Math.random() * 100);
        message = `Battery level: ${value}%`;
        details = value < 20 ? "Low battery warning" : "Battery status normal";
        break;
      case "signal":
        severity = Math.random() > 0.9 ? "warning" : "info";
        value = Math.round(Math.random() * 100);
        message = `Signal strength: ${value}%`;
        details = value < 30 ? "Poor signal quality" : "Signal quality normal";
        break;
    }

    logs.push({
      id: `log-${sensorId}-${i}`,
      timestamp,
      type,
      severity,
      message,
      value,
      details,
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const fetcher = async <T>(
  ...args: Parameters<typeof fetch>
): Promise<T> => {
  const res = await fetch(...args);

  const data: T = await res.json();
  return data;
};

export const tempSettings = {
  min: 18,
  max: 35,
};

export const humiSettings = {
  min: 40,
  max: 85,
};
