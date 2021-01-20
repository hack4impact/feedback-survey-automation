/**
 * Restores 'process.env...' from the corresponding value defined in .env for all App Scripts.
 */

// Externals
import { existsSync } from "fs";
import { readFile, rm, writeFile } from "fs/promises";
import { replaceInFile } from "replace-in-file";

// Internals
import { getAppScriptPaths, OUTPUT_ENV_PATH } from "./constants";

const restoreEnv = async () => {
  if (existsSync(OUTPUT_ENV_PATH)) {
    const envStr = await readFile(OUTPUT_ENV_PATH, "utf-8");
    const env: Record<string, string> = JSON.parse(envStr);
    const files = await getAppScriptPaths();

    const result = await replaceInFile({
      files,
      from: Object.values(env).map((value) => new RegExp(value, "g")),
      to: Object.keys(env).map((key) => `process.env.${key}`),
      countMatches: true,
    });

    result.forEach(async ({ file, hasChanged }) => {
      if (hasChanged) {
        const contents = await readFile(file, "utf-8");
        const newContents = contents.replace(/"(process.env.\w+)"/g, "$1");
        await writeFile(file, newContents, "utf-8");
      }
    });

    rm(OUTPUT_ENV_PATH);

    console.log(result);
  }
};

restoreEnv();
