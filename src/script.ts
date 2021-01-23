// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getAirtableTable } from "./Helpers/Airtable";
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
import { checkSurveyNeeded, normalizeDate } from "./Helpers/General";
import { sendReminderEmail } from "./Helpers/Email/";
import { createGoogleForm } from "./Helpers/Forms";
import { FIELDS } from "./Utils/constants";
import { ProjectData } from "./Utils/types";

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

  getAirtableTable(table, "Projects", (records, nextPage) => {
    records.forEach(async (record) => {
      const data = Object.entries(FIELDS).reduce((obj, [key, value]) => {
        if (typeof value === "string")
          return { ...obj, [key]: record.get(value) };
        if (Array.isArray(value))
          return {
            ...obj,
            [key]: value
              .map((v) => record.get(v))
              .filter((v) => v !== undefined),
          };
        return obj;
      }, {} as ProjectData);

      const id = record.getId();
      const deliveryDate = normalizeDate(data.deliveryDate as string);

      const surveyNeeded = checkSurveyNeeded(deliveryDate, data);

      if (surveyNeeded !== null) {
        await createGoogleForm(record, data, id);
        data.googleFormPublishedUrl = record.get(FIELDS.googleFormPublishedUrl);
        data.googleFormEditUrl = record.get(FIELDS.googleFormEditUrl);
        await sendReminderEmail(data, surveyNeeded);

        await record.updateFields({
          [FIELDS.lastSent]: surveyNeeded,
        });
      }
    });

    nextPage();
  });
};

script();
