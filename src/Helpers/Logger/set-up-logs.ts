// Externals
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";

// Internals
import { LOGS_PATH, OUTPUT_PATH } from "./constants";

const setUpLogs = async (): Promise<void> => {
  if (!existsSync(OUTPUT_PATH)) {
    await mkdir(OUTPUT_PATH);
  }

  await writeFile(LOGS_PATH, "{}", "utf-8");
};

export default setUpLogs;
