// Externals
import { config } from "dotenv-safe";
config();
import { readFile } from "fs/promises";
import { google } from "googleapis";
import { format } from "prettier";
import moment from "moment";

// Internals
import googleAuth from "./Helpers/google-auth";
import Logger from "../src/Helpers/Logger";

const uploadLogs = async () => {
  const oAuth2Client = await googleAuth();

  const drive = google.drive({
    version: "v3",
    auth: oAuth2Client,
  });

  const name = moment().format("MM-DD-YYYY") + ".json";

  Logger.line();
  Logger.log("Getting logs...");

  const rawLogs = await readFile(Logger.LOGS_PATH, "utf-8");
  const logs = format(rawLogs, { parser: "json-stringify" });

  Logger.success("Got logs!");
  Logger.line();
  Logger.log(`Creating '${name}' file...`);

  drive.files.create({
    requestBody: {
      name,
      parents: [process.env.LOGS_FOLDER as string],
    },
    media: {
      mimeType: "application/json",
      body: logs,
    },
  });

  Logger.success(`Created '${name}' file!`);
};

uploadLogs();
