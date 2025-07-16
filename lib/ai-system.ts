import { db } from "@/db/db";
import { desc } from "drizzle-orm";
import { tool } from "ai";
import { z } from "zod";
import { sensorData } from "@/db/schema";

export const roasting_system = `
You are an assistant for an IoT project. You must always respond in Indonesian (Bahasa Indonesia), regardless of the user’s language.

KONDISI_SUHU_DALAM_RUMAH TOOL:
- Use only the \`kondisi_suhu_dalam_rumah\` tool to check temperature and humidity “dalam rumah.”
- Whenever the user asks about temperature or humidity, invoke \`kondisi_suhu_dalam_rumah\`.
- Never check or request weather for any other location.

SWITCH TOOL INSTRUCTIONS:
- Available switch tools:
  • \`switch_tool_kipas\`: controls the fan on port 1.  
    – Parameters: \`port: "1"\`, \`action: "on" | "off"\`.  
  • \`switch_tool\`: controls relay port 2.  
    – Parameters: \`action: "on" | "off"\`.  
  • \`switch_tool_lampu_dalam_rumah\`: controls indoor light on port 3.  
    – Parameters: \`device: "lampu"\`, \`location: "dalam rumah"\`, \`action: "on" | "off"\`.  
  • \`switch_tool_semua_ruangan\`: controls ports 3 and 4 together.  
    – Parameters: \`action: "on" | "off"\`.  
- When the user asks to turn on/off any device:
  1. Identify the correct tool based on port mapping.
  2. Invoke that tool with the exact parameters.
  3. After execution, report the resulting state in Indonesian.
- If the operation fails, explain possible reasons (e.g., “device tidak terhubung”) in Indonesian.

PORT MAPPINGS:
- Port 1 → kipas  
- Port 2 → relay port 2  
- Port 3 → lampu dalam rumah  
- Port 4 → semua ruangan (gabungan port 3 & 4)

IMPORTANT:
- All responses must be in Indonesian only.
- Do not prompt the user to use any weather tool themselves.
- Do not refer to or check any location besides “dalam rumah.”

`;

export const weather_tool = tool({
  description: "Get the weather, temperature and humidity in a location",
  parameters: z.object({
    location: z
      .string()
      .describe("The location to get the weather information for"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .describe("The unit of temperature to return")
      .optional(),
  }),
  execute: async ({ location, unit = "celsius" }) => {
    console.log("executing weather tool", { location, unit });

    // Generate random temperature between 15-35°C or convert to Fahrenheit
    const tempCelsius = 15 + Math.floor(Math.random() * 20);
    const tempFahrenheit = Math.round((tempCelsius * 9) / 5 + 32);

    // Generate random humidity between 30-90%
    const humidity = 30 + Math.floor(Math.random() * 60);

    // Generate random weather condition
    const conditions = [
      "sunny",
      "cloudy",
      "rainy",
      "partly cloudy",
      "overcast",
      "stormy",
    ];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      location,
      temperature: unit === "celsius" ? tempCelsius : tempFahrenheit,
      unit: unit === "celsius" ? "°C" : "°F",
      humidity: humidity,
      condition: condition,
      timestamp: new Date().toISOString(),
    };
  },
});

// RELAY 1, 'NYALAKAN KIPAS DI PORT 1'
export const switch_tool_kipas = tool({
  description: "Turn on or off IoT fan connected to a specific port",
  parameters: z.object({
    port: z.string().describe("Port 1"),
    action: z
      .enum(["on", "off"])
      .describe("Action to perform on ports 1 : turn the fan on or off"),
  }),
  execute: async ({ port, action }) => {
    console.log("executing switch_tool_kipas", { port, action });
    return {
      port,
      action,
      current_state: action,
    };
  },
});

// RELAY 2
export const switch_tool = tool({
  description: "Turn on or off relay port 2",
  parameters: z.object({
    action: z
      .enum(["on", "off"])
      .describe("Action to perform on port 2: turn it on or off"),
  }),
  execute: async ({ action }) => {
    console.log("executing switch tool for port 2", { action });
    return {
      port: "port 2",
      action,
      current_state: action,
    };
  },
});

// RELAY 3
export const switch_tool_lampu_dalam_rumah = tool({
  description: "Turn on or off indoor lights",
  parameters: z.object({
    device: z
      .string()
      .describe("The indoor light to control 'hanya lampu saja'"),
    location: z
      .string()
      .describe("General location of the device (e.g., 'di dalam rumah')"),
    action: z
      .enum(["on", "off"])
      .describe("Action to perform: turn the outdoor light on or off"),
  }),
  execute: async ({ device, location, action }) => {
    console.log("executing outdoor light switch", { device, location, action });

    return {
      device,
      location,
      action,
      current_state: action,
    };
  },
});

// RELAY 4: nyalakan/matikan semua ruangan
export const switch_tool_semua_ruangan = tool({
  description: "Turn on or off ports 3 and 4",
  parameters: z.object({
    action: z
      .enum(["on", "off"])
      .describe("Action to perform on ports 3 and 4: turn them on or off"),
  }),
  execute: async ({ action }) => {
    console.log("executing switch tool for ports 3 and 4", { action });
    return {
      ports: ["port 3", "port 4"],
      action,
      current_state: action,
    };
  },
});

//kondisi suhu di dalam rumah
export const kondisi_suhu_dalam_rumah = tool({
  description:
    "Get the current temperature and humidity inside the house (dalam rumah)",
  parameters: z.object({}), // no parameters needed, fixed to 'dalam rumah'
  execute: async () => {
    console.log("executing kondisi_suhu_dalam_rumah");

    const latestReading = await db
      .select()
      .from(sensorData)
      .orderBy(desc(sensorData.timestamp))
      .limit(1);

    console.log("latestReading", latestReading);

    return {
      temperature: latestReading[0].temperature,
      humidity: latestReading[0].humidity,
      location: "dalam rumah",
    };
  },
});

// ga kepake sementara
export const roasting_tool = tool({
  description: "Choose one group to roast with brutal but funny comments",
  parameters: z.object({
    kelompok: z
      .enum(["Kelompok 2", "Kelompok 3", "Kelompok 4"])
      .describe(
        "The specific group to roast (must be one of 'Kelompok 2', 'Kelompok 3', or 'Kelompok 4')"
      ),
    topic: z
      .enum(["Tanah", "Cahaya", "Api"])
      .describe(
        "The topic of the group being roasted (Tanah for Group 2, Cahaya for Group 3, Api for Group 4)"
      ),
    roast_intensity: z
      .enum(["mild", "medium", "spicy"])
      .describe("How intense the roast should be")
      .optional(),
  }),
  execute: async ({ kelompok, topic, roast_intensity = "medium" }) => {
    console.log("executing roast tool", {
      kelompok,
      topic,
      roast_intensity,
    });
    return {
      kelompok,
      topic,
      roast_intensity,
    };
  },
});
