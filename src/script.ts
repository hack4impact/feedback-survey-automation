// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getProjectSuccessData } from "./Helpers/Airtable";
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
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

yargs(process.argv.slice(2)).argv;

const script = async () => {
  await Logger.setUp();
  const table = Airtable.base("app0TDYnyirqeRk1T");

  table("Projects")
    .select()
    .eachPage(
      async (projects, nextPage) => {
        for (const project of projects) {
          const data = parseProject(project);

          // Log the project's name
          Logger.bold(data.projectName.toString());

          // Make sure the project has all required fields. If not, throw an error.
          const checkedData = checkRequiredFields(data);
          const { projectStatus, projectSuccessData } = checkedData;

          const flattenedData = flattenFields(checkedData);

          // If project is not abandoned, continue
          if (checkProjectStatus(projectStatus)) {
            const successData = await getProjectSuccessData(
              table,
              projectSuccessData
            );

            // If project is in use by nonprofit, continue
            if (await checkInUse(successData, project)) {
              const reminderNeeded = checkReminderNeeded(flattenedData);

              if (reminderNeeded !== null) {
                const id = project.getId();
                await createGoogleForm(
                  project,
                  flattenedData,
                  id,
                  reminderNeeded
                );
                await sendReminderEmail(flattenedData, reminderNeeded);

                await project.updateFields({
                  [FIELDS.lastSent]: reminderNeeded,
                });
              }
            }
          }

          // Empty for formatting purposes
          console.log();
        }

        nextPage();
      },
      () => Logger.viewLogs()
    );
};

script();
