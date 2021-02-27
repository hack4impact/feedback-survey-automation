// Externals
import { config } from "dotenv-safe";
config();
import { google, drive_v3 } from "googleapis";
import moment from "moment";
import yargs from "yargs/yargs";

// Internals
import googleAuth from "./Helpers/google-auth";
import Logger from "../src/Helpers/Logger";

const args = yargs(process.argv.slice(2))
  .option("all", {
    alias: "a",
    type: "boolean",
    default: false,
  })
  .env("AIRTABLE_AUTOMATION").argv;

const cleanUpDryRuns = async () => {
  const oAuth2Client = await googleAuth();

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

    if (shouldDelete) await deleteFile(drive, id);
  }
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
