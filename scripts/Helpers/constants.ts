// Externals
import { join } from "path";

export const OUTPUT_PATH = join(__dirname, "..", "..", "output");
export const OUTPUT_ENV_PATH = join(OUTPUT_PATH, "env.json");

export const SRC_PATH = join(__dirname, "..", "..", "src");
export const UTILS_PATH = join(SRC_PATH, "Utils");

export const APPS_SCRIPT_PATH = join(SRC_PATH, "Helpers", "AppsScript", "src");
export const APPS_SCRIPT_CONFIG_PATH = join(
  APPS_SCRIPT_PATH,
  "..",
  "appsscript.json"
);

export const START_CONSTANTS = "// START CONSTANTS";
export const END_CONSTANTS = "// END CONSTANTS";
