import { sqliteTable, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Tabel tunggal untuk menyimpan data sensor (suhu dan kelembaban)
export const sensorData = sqliteTable("sensor_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
});

// definisi TypeScript helper
export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = typeof sensorData.$inferInsert;

// Tipe untuk tabel lama
// export type SensorTemperature = typeof sensorTemperature.$inferSelect;
// export type InsertSensorTemperature = typeof sensorTemperature.$inferInsert;
// export type SensorHumidity = typeof sensorHumidity.$inferSelect;
// export type InsertSensorHumidity = typeof sensorHumidity.$inferInsert;
