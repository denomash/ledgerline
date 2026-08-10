type LogLevel = "info" | "warn" | "error";
type Color = "blue" | "cyan" | "green" | "magenta" | "red";

const COLORS: Record<Color, number> = {
  blue: 34,
  cyan: 36,
  green: 32,
  magenta: 35,
  red: 31,
};

function colorise(message: string, color: Color): string {
  return `\x1b[${COLORS[color]}m${message}\x1b[39m`;
}

function log(level: LogLevel, source: string, message: string, data?: unknown): void {
  const params: unknown[] = [
    colorise(level.toUpperCase(), level === "error" ? "red" : "green"),
    colorise(`[${new Date().toISOString()}]`, "magenta"),
    colorise(`(${source})`, "blue"),
    colorise(message, "cyan"),
  ];
  if (data !== undefined) {
    params.push(typeof data === "object" ? JSON.stringify(data) : data);
  }

  if (level === "error") {
    console.error(...params);
  } else if (level === "warn") {
    console.warn(...params);
  } else {
    console.log(...params);
  }
}

export const logger = {
  info: (source: string, message: string, data?: unknown) => log("info", source, message, data),
  warn: (source: string, message: string, data?: unknown) => log("warn", source, message, data),
  error: (source: string, message: string, data?: unknown) => log("error", source, message, data),
};
