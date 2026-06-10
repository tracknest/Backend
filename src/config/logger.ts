import winston from "winston";
import path from "path";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const currentLevel = (): string => {
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
});

// Shared timestamp + error stack format
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // include stack trace on Error objects
  winston.format.splat(), // enables printf-style: logger.info("Hello %s", name)
);

// Pretty coloured output for the terminal (development only)
const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  }),
);

// Structured JSON for log aggregators (Datadog, Logtail, CloudWatch etc.)
const fileFormat = winston.format.combine(baseFormat, winston.format.json());

const transports: winston.transport[] = [
  // Always log to console
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// In production, also write structured JSON logs to rotating files
if (process.env.NODE_ENV === "production") {
  transports.push(
    // All logs at warn level and above
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5, // keep last 5 rotated files
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: currentLevel(),
  levels,
  transports,
  exitOnError: false,
});

export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
