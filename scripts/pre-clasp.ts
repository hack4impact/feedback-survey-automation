/**
 * Replaces 'process.env...' with the corresponding value defined in .env for all App Scripts.
 * Adds constants to AppsScript that require them.
 */

// Externals
import { config } from "dotenv-safe";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { replaceInFile } from "replace-in-file";
import recursive from "recursive-readdir";

// Internals
import {
  OUTPUT_PATH,
  OUTPUT_ENV_PATH,
  APPS_SCRIPT_PATH,
  UTILS_PATH,
  START_CONSTANTS,
  END_CONSTANTS,
} from "./Helpers/constants";

config();

const replaceEnv = async () => {
  if (!existsSync(OUTPUT_PATH)) {
    await mkdir(OUTPUT_PATH);
  }

  if (!existsSync(OUTPUT_ENV_PATH)) {
    await writeFile(OUTPUT_ENV_PATH, "{}", "utf-8");
  }

  const files = await recursive(APPS_SCRIPT_PATH);

  const result = await replaceInFile({
    files,
    from: /process\.env\.(\w+)/g,
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

const addFields = async () => {
  const constants = await readFile(join(UTILS_PATH, "constants.ts"), "utf-8");

  const start = constants.indexOf(START_CONSTANTS);
  const end = constants.indexOf(END_CONSTANTS);

  const fields = constants
    .substring(start, end + END_CONSTANTS.length)
    .replace(new RegExp("export", "g"), "");

  const files = await recursive(APPS_SCRIPT_PATH);

  const result = await replaceInFile({
    files,
    from: /\/\/ START CONSTANTS(.|\n)*\/\/ END CONSTANTS/g,
    to: fields,
  });

  console.log(result);
};

const preClasp = async () => {
  await replaceEnv();
  await addFields();
};

preClasp();
