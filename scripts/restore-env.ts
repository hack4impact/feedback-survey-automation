/**
 * Restores 'process.env...' from the corresponding value defined in .env for all App Scripts.
 */

// Externals
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { replaceInFile } from "replace-in-file";

// Internals
import { getAppScriptPaths, OUTPUT_ENV_PATH } from "./constants";

const restoreEnv = async () => {
  if (existsSync(OUTPUT_ENV_PATH)) {
    const envStr = await readFile(OUTPUT_ENV_PATH, "utf-8");
    const env = JSON.parse(envStr);
    const files = await getAppScriptPaths();

    const result = replaceInFile({
      files,
      from: Object.values(env),
      to: Object.keys(env).map((key) => `process.env.${key}`),
    });

    console.log(result);
  }
};

restoreEnv();
