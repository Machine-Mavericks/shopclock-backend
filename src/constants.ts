import { ConsoleLogger, FileLogger, Logger } from "./logger";

export const VERSION: string = "1.0.0"

// change to true in prod
export const IS_PRODUCTION = undefined;

export const LOGGER: Logger = IS_PRODUCTION ? new FileLogger(process.env.LOG_FILE ?? "./backend.log") : new ConsoleLogger();

export const PORT: number = Number(process.env.PORT) || 3000;

// DB stuffs
export const DB_USER: string = process.env.DB_USER || "shopclock";
export const DB_PASSWORD: string = process.env.DB_PASSWORD || "";
export const DB_HOST: string = process.env.DB_HOST || "localhost"
export const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
export const DB_NAME: string = process.env.DB_NAME || "shopclock"