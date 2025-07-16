import React, { useMemo } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltipContent } from "./ui/chart";
import {
  CartesianGrid,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useSensorData } from "@/hooks/useSensorData";
import { Skeleton } from "./ui/skeleton";

// Komponen loading untuk chart
function ChartLoading() {
  return (
    <div className="flex h-[300px] w-full flex-col gap-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="relative flex-1">
        {/* Garis grid horizontal */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full border-t border-dashed border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>

        {/* Area chart skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-primary/10 to-transparent rounded-md" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent rounded-md" />

        {/* Y-axis ticks */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-8" />
          ))}
        </div>
        <div className="absolute right-0 inset-y-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-8" />
          ))}
        </div>

        {/* X-axis ticks */}
        <div className="absolute bottom-0 inset-x-0 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-10" />
          ))}
        </div>

        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 bg-background/80 p-4 rounded-lg backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Memuat data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemperatureChart() {
  const { sensorData, isLoading } = useSensorData();

  // Format data untuk chart
  const formattedData = useMemo(() => {
    if (!sensorData || sensorData.length === 0) return [];

    return sensorData
      .map((item) => {
        const date = new Date(item.timestamp);
        return {
          id: item.id,
          time: `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${date
            .getSeconds()
            .toString()
            .padStart(2, "0")}`,
          temperature: item.temperature,
          humidity: item.humidity,
        };
      })
      .reverse(); // Urutkan dari yang terlama ke terbaru
  }, [sensorData]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Monitoring Suhu & Kelembaban</CardTitle>
        <CardDescription>
          Menampilkan suhu dan kelembaban terkini
        </CardDescription>
      </CardHeader>
      <CardContent className="p-7">
        {isLoading ? (
          <ChartLoading />
        ) : (
          <ChartContainer
            config={{
              temperature: {
                label: "Suhu (°C)",
                color: "hsl(var(--chart-1))",
              },
              humidity: {
                label: "Kelembaban (%)",
                color: "hsl(217, 91%, 60%)",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="dark:stroke-[#aaa]"
                />
                {/* Left Y-Axis for Temperature */}
                <YAxis
                  yAxisId="left"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tickMargin={8}
                  tickCount={5}
                  className="dark:stroke-[#aaa]"
                  tickFormatter={(value) => `${value}°C`}
                />
                {/* Right Y-Axis for Humidity */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]}
                  // domain={[humiSettings.min, humiSettings.max]}
                  tickMargin={8}
                  tickCount={5}
                  className="dark:stroke-[#4f91fc]"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                  labelFormatter={(value) => `Waktu: ${value}`}
                  formatter={(value, name) => {
                    if (name === "temperature") return [`${value}°C`, "Suhu"];
                    if (name === "humidity") return [`${value}%`, "Kelembaban"];
                    return [value, name];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    if (value === "temperature") return "Suhu";
                    if (value === "humidity") return "Kelembaban";
                    return value;
                  }}
                />
                {/* Temperature Area */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="temperature"
                  stroke="var(--color-temperature)"
                  fill="var(--color-temperature)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                {/* Humidity Area */}
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="humidity"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Monitoring real-time <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Data terupdate setiap 1 menit
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default TemperatureChart;
