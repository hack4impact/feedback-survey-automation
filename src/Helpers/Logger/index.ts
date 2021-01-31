// Externals
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export type LogType = "success" | "info" | "error" | "warning";

export type LogMessage = string | Record<string, any> | LogMessage[];

export type LogTimestamp = number;

export type LogIndex = number;

export type LogExtra = unknown;

export interface Log {
  message: LogMessage;
  type: LogType;
  timestamp: LogTimestamp;
  index: LogIndex;
  extra: LogExtra;
}

class Logger {
  static readonly logs: Log[] = [];
  static readonly COLORS = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
  };

  static readonly OUTPUT_PATH = join(__dirname, "..", "..", "..", "output");
  static readonly LOGS_PATH = join(Logger.OUTPUT_PATH, "logs.json");

  static async setUp(): Promise<void> {
    if (!existsSync(this.OUTPUT_PATH)) {
      await mkdir(this.OUTPUT_PATH);
    }

    await this.writeLogs();
  }

  static async getLogs(): Promise<Log[]> {
    const rawLogs = await readFile(this.LOGS_PATH, "utf-8");
    return JSON.parse(rawLogs) as Log[];
  }

  static writeLogs(): Promise<void> {
    return writeFile(this.LOGS_PATH, JSON.stringify(this.logs), "utf-8");
  }

  static async log(
    message: LogMessage,
    type: LogType,
    extra?: LogExtra
  ): Promise<Log> {
    const log: Log = {
      message,
      type,
      timestamp: Date.now(),
      extra,
      index: this.logs.length,
    };

    this.logs.push(log);
    await this.writeLogs();

    console.log(`Logged ${type} message`);

    return log;
  }

  static success(message: LogMessage, extra?: LogExtra): Promise<Log> {
    return this.log(message, "success", extra);
  }

  static error(message: LogMessage, extra?: LogExtra): Promise<Log> {
    return this.log(message, "error", extra);
  }

  static warning(message: LogMessage, extra?: LogExtra): Promise<Log> {
    return this.log(message, "warning", extra);
  }

  static info(message: LogMessage, extra?: LogExtra): Promise<Log> {
    return this.log(message, "info", extra);
  }

  static bold(message: unknown): void {
    console.log(`${this.COLORS.Bright}${message}${this.COLORS.Reset}`);
  }

  static viewLogs(): void {
    console.log(`View logs: ${this.LOGS_PATH}`);
  }
}

export default Logger;
