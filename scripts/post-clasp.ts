/**
 * Restores 'process.env...' from the corresponding value defined in .env for all App Scripts.
 * Removes constants that were added in the pre-clasp script.
 */

// Externals
import { existsSync } from "fs";
import { readFile, rm } from "fs/promises";
import { replaceInFile } from "replace-in-file";
import recursive from "recursive-readdir";

// Internals
import {
  APPS_SCRIPT_PATH,
  END_CONSTANTS,
  OUTPUT_ENV_PATH,
  START_CONSTANTS,
} from "./Helpers/constants";

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

const removeFields = async () => {
  const files = await recursive(APPS_SCRIPT_PATH);

  const result = await replaceInFile({
    files,
    from: /\/\/ START CONSTANTS(.|\n)*\/\/ END CONSTANTS/g,
    to: START_CONSTANTS + "\n" + END_CONSTANTS,
  });

  console.log(result);
};

const postClasp = async () => {
  await restoreEnv();
  await removeFields();
};

postClasp();
