// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs";
import Airtable from "airtable";

// Internals
import {
  getProjectSuccessData,
  getStandardQuestions,
} from "./Helpers/Airtable";
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
  Logger.error(e);
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  Logger.error(e);
  process.exit(1);
});

const args = yargs(process.argv.slice(2)).option("dry-run", {
  alias: "d",
  type: "boolean",
  default: true,
}).argv;

const script = async () => {
  const dryRun = args["dry-run"] || process.env.DRY_RUN !== "false";

  const logger = new Logger(dryRun);
  try {
    const table = Airtable.base(process.env.AIRTABLE_BASE_ID ?? "");

    const standardQuestions = await getStandardQuestions(table);

    table("Projects")
      .select()
      .eachPage(
        async (projects, nextPage) => {
          for (const project of projects) {
            const data = parseProject(project);
            const { projectName } = data;

            // Checks for empty rows
            if (typeof projectName !== "string") continue;

            // Log the project's name
            Logger.line();
            Logger.bold(projectName);

            // Make sure the project has all required fields. If not, throw an error.
            const checkedData = checkRequiredFields(data);

            // Flatten fields that are supposed to be strings (but Airtable returns an array with 1 element)
            const flattenedData = flattenFields(checkedData);
            const { projectStatus, projectSuccessData } = flattenedData;

            // If project is abandoned, skip
            if (!(await checkProjectStatus(logger, projectStatus))) continue;

            const successData = await getProjectSuccessData(
              table,
              projectSuccessData
            );

            // If project is not in use by nonprofit, skip
            if (
              !(await checkInUse(
                successData,
                project,
                standardQuestions,
                dryRun,
                logger
              ))
            )
              continue;

            const reminderNeeded = await checkReminderNeeded(
              flattenedData,
              logger
            );

            // If reminder not needed, skip
            if (reminderNeeded === null) continue;

            await createGoogleForm(
              project,
              flattenedData,
              reminderNeeded,
              dryRun,
              logger
            );
            await sendReminderEmail(
              flattenedData,
              reminderNeeded,
              logger,
              dryRun
            );

            !dryRun &&
              (await project.updateFields({
                [FIELDS.lastSent]: reminderNeeded,
              }));
          }

          nextPage();
        },
        () => logger.finish()
      );
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
};

script();
