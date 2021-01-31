/**
 * Restores 'process.env...' from the corresponding value defined in .env for all App Scripts.
 */

// Externals
import { existsSync } from "fs";
import { readFile, rm } from "fs/promises";
import { replaceInFile } from "replace-in-file";
import recursive from "recursive-readdir";

// Internals
import { APPS_SCRIPT_PATH, OUTPUT_ENV_PATH } from "./Helpers/constants";

const restoreEnv = async () => {
  if (existsSync(OUTPUT_ENV_PATH)) {
    const envStr = await readFile(OUTPUT_ENV_PATH, "utf-8");
    const env: Record<string, string> = JSON.parse(envStr);
    const files = await recursive(APPS_SCRIPT_PATH);

    const result = await replaceInFile({
      files,
      from: Object.values(env).map((value) => new RegExp(`"${value}"`, "g")),
      to: Object.keys(env).map((key) => `process.env.${key}`),
      countMatches: true,
    });

    await rm(OUTPUT_ENV_PATH);

    console.log(result);
  }
};

restoreEnv();
