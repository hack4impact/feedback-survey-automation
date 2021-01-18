// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import createGoogleForm from "./createGoogleForm";
import getSheetData from "./get-sheet-data";
import getAirtableTable from "./Helpers/Airtable/get-airtable-table";
import { daysSince } from "./Helpers/General";
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
  // const sheetData = await getSheetData();

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
