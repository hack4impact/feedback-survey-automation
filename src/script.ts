// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import createGoogleForm from "./createGoogleForm";
import { getAirtableTable } from "./Helpers/Airtable";
import { getSheetData, daysSince } from "./Helpers/General";
import { FIELDS, SPREADSHEET_ID } from "./Utils/constants";

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
  const sheetData = await getSheetData(SPREADSHEET_ID);

  const table = Airtable.base("app0TDYnyirqeRk1T");

  getAirtableTable(table, "Projects", (records, nextPage) => {
    records.forEach((record) => {
      const releaseDate: string = record.get(FIELDS.releaseDate);
      const daysAgo = daysSince(releaseDate);

      const questions: string[] = FIELDS.questions.map((question) =>
        record.get(question)
      );
    });

    nextPage();
  });
};

script();
