// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getProjectSuccessData } from "./Helpers/Airtable";
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
import {
  checkSurveyNeeded,
  checkRequiredFields,
  parseRecord,
  checkProjectStatus,
} from "./Helpers/General";
import { sendReminderEmail } from "./Helpers/Email";
import { createGoogleForm } from "./Helpers/Forms";
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

const script = () => {
  const table = Airtable.base("app0TDYnyirqeRk1T");

  table("Projects")
    .select()
    .eachPage((records, nextPage) => {
      records.forEach(async (record) => {
        const data = parseRecord(record);

        const checkedData = checkRequiredFields(data);
        const { projectStatus, projectSuccessData } = checkedData;

        // If project is abandoned, don't perform any actions
        if (!checkProjectStatus(projectStatus)) return;

        await getProjectSuccessData(table, projectSuccessData);

        const id = record.getId();

        const surveyNeeded = checkSurveyNeeded(checkedData);

        if (surveyNeeded !== null) {
          await createGoogleForm(record, checkedData, id, surveyNeeded);
          await sendReminderEmail(checkedData, surveyNeeded);

          await record.updateFields({
            [FIELDS.lastSent]: surveyNeeded,
          });
        }
      });

      nextPage();
    });
};

script();
