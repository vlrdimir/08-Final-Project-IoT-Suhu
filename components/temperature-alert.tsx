import React from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";

function TemperatureAlert() {
  return (
    <Alert className="alert-orange">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-300">
          Temperature alerts detected! Check sensors with readings outside
          normal thresholds.
        </AlertDescription>
      </div>
    </Alert>
  );
}

export default TemperatureAlert;
