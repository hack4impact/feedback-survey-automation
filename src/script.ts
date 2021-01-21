// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getAirtableTable } from "./Helpers/Airtable";
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
import { checkSurveyNeeded, normalizeDate } from "./Helpers/General";
import { sendNonprofitMail } from "./Helpers/Email/";
import { createGoogleForm } from "./Helpers/Forms";
import { FIELDS } from "./Utils/constants";
import { TimePeriod } from "./Utils/types";

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
  const table = Airtable.base("app0TDYnyirqeRk1T");

  getAirtableTable(table, "Projects", (records, nextPage) => {
    records.forEach(async (record) => {
      const id = record.getId();
      const projectName = record.get(FIELDS.projectName);
      const questions: string[] = FIELDS.questions
        .map((question) => record.get(question))
        .filter((question) => typeof question === "string" && question.length);

      const releaseDate = normalizeDate(record.get(FIELDS.releaseDate));
      const lastSent: TimePeriod | undefined = record.get(FIELDS.lastSent);
      let googleFormUrl = record.get(FIELDS.googleFormUrl);

      if (typeof googleFormUrl !== "string") {
        await createGoogleForm(record, projectName, id, questions);
        googleFormUrl = record.get(FIELDS.googleFormUrl);
      }

      const surveyNeeded = checkSurveyNeeded(releaseDate, lastSent);

      if (surveyNeeded !== false) {
        const nonprofitEmail = record.get(FIELDS.nonprofitContactEmail);
        const nonprofitName = record.get(FIELDS.nonprofitName);
        const nonprofitContactName = record.get(FIELDS.nonprofitContactName);

        await sendNonprofitMail(
          nonprofitEmail,
          projectName,
          nonprofitName,
          nonprofitContactName,
          googleFormUrl,
          surveyNeeded
        );

        await record.updateFields({
          [FIELDS.lastSent]: surveyNeeded,
        });
      }
    });

    nextPage();
  });
};

script();
