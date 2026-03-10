/**
 * Structured logger for Privatio.
 * Outputs JSON logs in production for easy parsing by log aggregators.
 * In development, outputs human-readable format.
 *
 * Future: Replace with Pino, Winston, or integrate with Sentry.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isProd = process.env.NODE_ENV === "production";

function formatError(err: unknown): LogEntry["error"] | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: isProd ? undefined : err.stack,
    };
  }
  return { name: "UnknownError", message: String(err) };
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, err?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (context) entry.context = context;
  if (data) entry.data = data;
  if (err) entry.error = formatError(err);

  if (isProd) {
    // JSON format for log aggregators
    const output = JSON.stringify(entry);
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  } else {
    // Human-readable in development
    const prefix = `[${level.toUpperCase()}]${context ? ` [${context}]` : ""}`;
    if (level === "error") {
      console.error(prefix, message, data || "", err || "");
    } else if (level === "warn") {
      console.warn(prefix, message, data || "");
    } else if (level === "debug") {
      console.debug(prefix, message, data || "");
    } else {
      console.log(prefix, message, data || "");
    }
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("debug", message, context, data),

  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("info", message, context, data),

  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("warn", message, context, data),

  error: (message: string, context?: string, err?: unknown, data?: Record<string, unknown>) =>
    log("error", message, context, data, err),
};
