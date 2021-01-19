// Externals
import { readdir } from "fs/promises";
import { join, resolve } from "path";

export const OUTPUT_PATH = join(__dirname, "..", "output");
export const OUTPUT_ENV_PATH = join(OUTPUT_PATH, "env.json");
export const APPS_SCRIPT_PATH = join(
  __dirname,
  "..",
  "src",
  "Helpers",
  "AppsScript"
);
export const APPS_SCRIPT_CONFIG_PATH = join(
  APPS_SCRIPT_PATH,
  "appsscript.json"
);

export const getAppScriptPaths = async (): Promise<string[]> => {
  const files = await readdir(APPS_SCRIPT_PATH, "utf-8");

  return files.map((file) =>
    resolve(process.cwd(), join(APPS_SCRIPT_PATH, file))
  );
};
