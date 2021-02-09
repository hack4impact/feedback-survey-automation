// Externals
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export type LogType = "success" | "info" | "error" | "warning";

export type LogMessage = string;

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
  static readonly VIEW_LOGS_MESSAGE = " (View logs for details)";
  static dryRun = false;

  static async setUp(isDryRun: boolean): Promise<void> {
    this.dryRun = isDryRun;
    if (!existsSync(this.OUTPUT_PATH)) {
      await mkdir(this.OUTPUT_PATH);
    }

    await this.writeLogs();
  }

  static async getLogs(): Promise<Log[]> {
    const rawLogs = await readFile(this.LOGS_PATH, "utf-8");
    return JSON.parse(rawLogs);
  }

  static writeLogs(): Promise<void> {
    return writeFile(this.LOGS_PATH, JSON.stringify(this.logs), "utf-8");
  }

  static async write(
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

    return log;
  }

  static log(message: string): void {
    console.log(message);
  }

  static line(): void {
    console.log();
  }

  static coloredLog(
    color: keyof typeof Logger.COLORS,
    message: string,
    extra = ""
  ): void {
    console.log(`${this.COLORS[color]}${message}${this.COLORS.Reset}${extra}`);
  }

  static bold(message: LogMessage, extra = ""): void {
    this.coloredLog("Bright", message, extra);
  }

  private static async logWithType(
    type: LogType,
    color: keyof typeof Logger.COLORS,
    message: LogMessage,
    extra?: LogExtra
  ) {
    let extraLog = "";
    if (extra !== undefined) {
      await this.write(message, type, extra);
      extraLog = this.VIEW_LOGS_MESSAGE;
    }
    this.coloredLog(color, message, extraLog);
  }

  static success(message: LogMessage, extra?: LogExtra): Promise<void> {
    return this.logWithType("success", "FgGreen", message, extra);
  }

  static info(message: LogMessage, extra?: LogExtra): Promise<void> {
    return this.logWithType("info", "FgBlue", message, extra);
  }

  static warning(message: LogMessage, extra?: LogExtra): Promise<void> {
    return this.logWithType("warning", "FgYellow", message, extra);
  }

  static error(message: LogMessage, extra?: LogExtra): Promise<void> {
    return this.logWithType("error", "FgRed", message, extra);
  }

  static finish(): void {
    if (this.dryRun)
      this.info(
        `Dry Run finished with ${this.COLORS.Bright}NO ACTIONS PERFORMED${this.COLORS.Reset}${this.COLORS.FgBlue} that affected the Airtable. To perform a real run, use ${this.COLORS.Reverse}npm run make`
      );
    this.log(`View logs: ${this.LOGS_PATH}`);
  }
}

export default Logger;
