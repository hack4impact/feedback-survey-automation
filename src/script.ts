// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getAirtableTable } from "./Helpers/Airtable";
// import { getSheetData, setSheetData, setUpSheets } from "./Helpers/Sheets";
import { checkSurveyNeeded, normalizeDate } from "./Helpers/General";
import sendMail from "./Helpers/send-mail";
import createGoogleForm from "./Helpers/create-google-form";
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
      const releaseDate = normalizeDate(record.get(FIELDS.releaseDate));
      const lastSent: TimePeriod | undefined = record.get(FIELDS.lastSent);

      const surveyNeeded = checkSurveyNeeded(releaseDate, lastSent);

      if (surveyNeeded) {
        const questions: string[] = FIELDS.questions.map((question) =>
          record.get(question)
        );

        const { editUrl, publishedUrl } = await createGoogleForm(
          "Test 2",
          "5 Months",
          questions
        );
        await sendMail("avhack4impact@gmail.com", publishedUrl, 0);

        console.log(surveyNeeded);
        console.log(questions);
      }
    });

    nextPage();
  });
};

script();
