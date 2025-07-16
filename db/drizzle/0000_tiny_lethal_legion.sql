CREATE TABLE `sensor_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`temperature` real NOT NULL,
	`humidity` real NOT NULL
);
