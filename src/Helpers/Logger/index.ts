// Externals
import { join } from "path";
import Hack4ImpactLogger from "@hack4impact/logger";
import { existsSync, mkdirSync } from "fs";

class Logger extends Hack4ImpactLogger {
  static readonly OUTPUT_PATH = join(__dirname, "..", "..", "..", "output");
  static readonly LOGS_PATH = join(Logger.OUTPUT_PATH, "logs.json");
  static readonly VIEW_LOGS_MESSAGE = " (View logs for details)";
  private dryRun = false;

  constructor(dryRun: boolean) {
    super(Logger.LOGS_PATH);
    this.dryRun = dryRun;
    // Use 'sync' methods instead of promises (inside constructor)
    if (!existsSync(Logger.OUTPUT_PATH)) {
      mkdirSync(Logger.OUTPUT_PATH, { recursive: true });
    }
  }

  public finish(): void {
    Logger.line();
    if (this.dryRun) {
      this.info(
        `Dry Run finished with ${Logger.COLORS.Bright}NO ACTIONS PERFORMED${Logger.COLORS.Reset}${Logger.COLORS.FgBlue} that affected the Airtable. To perform a real run, set DRY_RUN to false in .env and use ${Logger.COLORS.Reverse}npm run make:prod`
      );
    }
    this.log(`View logs: ${Logger.LOGS_PATH}`);
  }
}

export default Logger;
