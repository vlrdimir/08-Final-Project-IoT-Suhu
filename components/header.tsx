import { Wifi, WifiOff } from "lucide-react";
import { ModeToggle } from "./toggle-mode";

function HeaderMonitoring({ isConnected }: { isConnected: boolean }) {
  return (
    // {/* Header Monitoring */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Temperature Monitor</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Real-time IoT temperature monitoring system
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {isConnected && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isConnected
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Disconnected
                </span>
              </>
            )}
          </div>
        )}

        {/* Dark Mode Toggle */}
        <ModeToggle />
      </div>
    </div>
  );
}

export default HeaderMonitoring;
