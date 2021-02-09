// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getProjectSuccessData } from "./Helpers/Airtable";
import {
  checkReminderNeeded,
  checkRequiredFields,
  checkProjectStatus,
  checkInUse,
} from "./Helpers/Checks";
import { sendReminderEmail } from "./Helpers/Email";
import { createGoogleForm } from "./Helpers/Forms";
import { parseProject, flattenFields } from "./Helpers/General";
import Logger from "./Helpers/Logger";
import { FIELDS } from "./Utils/constants";

process.on("unhandledRejection", (e) => {
  console.error(e);
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  console.error(e);
  process.exit(1);
});

const args = yargs(process.argv.slice(2))
  .option("dry-run", {
    alias: "d",
    type: "boolean",
    default: false,
  })
  .env("AIRTABLE_AUTOMATION").argv;

const script = async () => {
  const { "dry-run": dryRun } = args;

  await Logger.setUp(dryRun);
  const table = Airtable.base("app0TDYnyirqeRk1T");

  table("Projects")
    .select()
    .eachPage(
      async (projects, nextPage) => {
        for (const project of projects) {
          const data = parseProject(project);

          // Checks for empty rows
          if (typeof data.projectName !== "string") continue;

          // Log the project's name
          Logger.line();
          Logger.bold(data.projectName);

          // Make sure the project has all required fields. If not, throw an error.
          const checkedData = checkRequiredFields(data);

          // Flatten fields that are supposed to be strings (but Airtable returns an array with 1 element)
          const flattenedData = flattenFields(checkedData);
          const { projectStatus, projectSuccessData } = flattenedData;

          // If project is abandoned, skip
          if (!checkProjectStatus(projectStatus)) continue;

          const successData = await getProjectSuccessData(
            table,
            projectSuccessData
          );

          // If project is not in use by nonprofit, skip
          if (!(await checkInUse(successData, project))) continue;

          const reminderNeeded = checkReminderNeeded(flattenedData);

          // If reminder not needed, skip
          if (reminderNeeded === null) continue;

          await createGoogleForm(
            project,
            flattenedData,
            reminderNeeded,
            dryRun
          );
          await sendReminderEmail(flattenedData, reminderNeeded);

          !dryRun &&
            (await project.updateFields({
              [FIELDS.lastSent]: reminderNeeded,
            }));
        }

        nextPage();
      },
      () => Logger.finish()
    );
};

script();
