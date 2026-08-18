import { ConsoleLogger, FileLogger, Logger } from "./logger";

export const VERSION: string = "1.0.0"

// change to true in prod
export const IS_PRODUCTION = undefined;

export const LOGGER: Logger = IS_PRODUCTION ? new FileLogger(process.env.LOG_FILE ?? "./backend.log") : new ConsoleLogger();