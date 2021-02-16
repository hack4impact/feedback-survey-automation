// Externals
import { config } from "dotenv-safe";
config();
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { promisify } from "util";
import readline, { createInterface } from "readline";
import { google, Auth, drive_v3 } from "googleapis";
import moment from "moment";
import yargs from "yargs/yargs";

// Internals
import keyfile from "../credentials.json";
import Logger from "../src/Helpers/Logger";

const args = yargs(process.argv.slice(2))
  .option("all", {
    alias: "a",
    type: "boolean",
    default: false,
  })
  .env("AIRTABLE_AUTOMATION").argv;

readline.Interface.prototype.question[promisify.custom] = function (
  prompt: string
) {
  return new Promise((resolve) =>
    readline.Interface.prototype.question.call(this, prompt, resolve)
  );
};

// @ts-expect-error Defining new method
readline.Interface.prototype.questionAsync = promisify(
  readline.Interface.prototype.question
);

const TOKEN_PATH = join(__dirname, "..", "oauth-token.json");

const cleanUpDryRuns = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    keyfile.installed.client_id,
    keyfile.installed.client_secret,
    keyfile.installed.redirect_uris[0]
  );

  await authorize(oAuth2Client);

  const drive = google.drive({
    version: "v3",
    auth: oAuth2Client,
  });

  const dryRunsFolder = await getAllDryRuns(drive);

  for (const item of dryRunsFolder.files ?? []) {
    Logger.line();
    const id = item.id ?? "";

    const fileData = await getDryRunData(drive, id);

    Logger.bold(fileData.name ?? "");

    const shouldDelete = shouldDeleteFile(fileData);

    if (shouldDelete) deleteFile(drive, id);
  }
};

const authorize = async (
  oAuth2Client: Auth.OAuth2Client
): Promise<Auth.Credentials> => {
  Logger.log("Authorizing...");
  let token: Auth.Credentials;
  try {
    const rawToken = await readFile(TOKEN_PATH, "utf-8");
    token = JSON.parse(rawToken);
    oAuth2Client.setCredentials(token);
  } catch (e) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive"],
    });

    Logger.line();
    Logger.log(`Authorize this app by visiting this url: ${authUrl}`);

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    Logger.line();
    // @ts-expect-error Defined method at the top of the file
    const code = await rl.questionAsync("Enter the code from that page here: ");

    rl.close();

    const { tokens } = await oAuth2Client.getToken(code);
    token = tokens;

    oAuth2Client.setCredentials(token);

    await writeFile(TOKEN_PATH, JSON.stringify(token));

    Logger.success(`Token stored at ${TOKEN_PATH}`);
    Logger.line();
  }
  Logger.success("Authorized!");
  return token;
};

const getAllDryRuns = async (
  drive: drive_v3.Drive
): Promise<drive_v3.Schema$FileList> => {
  Logger.line();
  Logger.log("Fetching 'Dry Run Forms' Folder...");
  const response = await drive.files.list({
    q: `'${process.env.DRY_RUN_FOLDER}' in parents and trashed = false`,
  });
  Logger.success("Fetched 'Dry Run Forms' Folder!");
  return response.data;
};

const getDryRunData = async (
  drive: drive_v3.Drive,
  id: string
): Promise<drive_v3.Schema$File> => {
  const itemResponse = await drive.files.get({
    fileId: id,
    fields: "name,trashed,modifiedTime",
  });

  const { data: fileData } = itemResponse;
  return fileData;
};

const shouldDeleteFile = (fileData: drive_v3.Schema$File): boolean => {
  const { all } = args;
  const { modifiedTime, trashed } = fileData;
  const oneMonthAgo = moment().subtract(1, "month");
  const isStale = moment(modifiedTime).isBefore(oneMonthAgo);

  return (all || isStale) && !trashed;
};

const deleteFile = async (drive: drive_v3.Drive, id: string) => {
  Logger.log("Deleting file...");
  await drive.files.delete({
    fileId: id,
  });
  Logger.success("Deleted file!");
};

cleanUpDryRuns();
