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

function extractStack(data: unknown): { stack?: string; rest: unknown } {
  if (data && typeof data === "object" && "stack" in data && typeof (data as { stack?: unknown }).stack === "string") {
    const { stack, ...rest } = data as { stack: string; [key: string]: unknown };
    return { stack, rest: Object.keys(rest).length > 0 ? rest : undefined };
  }
  return { rest: data };
}

function log(level: LogLevel, source: string, message: string, data?: unknown): void {
  const { stack, rest } = extractStack(data);

  const params: unknown[] = [
    colorise(level.toUpperCase(), level === "error" ? "red" : "green"),
    colorise(`[${new Date().toISOString()}]`, "magenta"),
    colorise(`(${source})`, "blue"),
    colorise(message, "cyan"),
  ];
  if (rest !== undefined) {
    params.push(typeof rest === "object" ? JSON.stringify(rest) : rest);
  }

  if (level === "error") {
    console.error(...params);
    if (stack) {
      console.error(colorise(stack, "red"));
    }
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
