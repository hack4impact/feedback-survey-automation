/**
 * Replaces 'process.env...' with the corresponding value defined in .env for all App Scripts.
 */

// Externals
import { config } from "dotenv-safe";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { replaceInFile } from "replace-in-file";

// Internals
import {
  OUTPUT_PATH,
  OUTPUT_ENV_PATH,
  getAppScriptPaths,
} from "./Helpers/constants";

config();

const replaceEnv = async () => {
  if (!existsSync(OUTPUT_PATH)) {
    await mkdir(OUTPUT_PATH);
  }

  await writeFile(OUTPUT_ENV_PATH, "{}", "utf-8");

  const files = await getAppScriptPaths();

  const result = await replaceInFile({
    files,
    from: [/process\.env\.(\w+)/g],
    to: (match) => {
      const sliced = match.slice(12);

      const envVar = process.env[sliced];

      if (envVar === undefined)
        throw new Error(`Env variable '${sliced}' does not exist`);

      const currentOutput = JSON.parse(readFileSync(OUTPUT_ENV_PATH, "utf-8"));
      currentOutput[sliced] = envVar;
      writeFileSync(OUTPUT_ENV_PATH, JSON.stringify(currentOutput));

      console.log(
        `Added ${sliced} variable and its value to ${resolve(
          process.cwd(),
          OUTPUT_ENV_PATH
        )}`
      );

      return `"${envVar}"` as string;
    },
    countMatches: true,
  });

  console.log(result);
};

replaceEnv();
