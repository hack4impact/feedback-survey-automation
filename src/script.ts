// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";

// Internals
import { getAirtableTable } from "./Helpers/Airtable";
import { getSheetData, daysBetween } from "./Helpers/General";
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
      const id = record.getId();
      const releaseDate: string = record.get(FIELDS.releaseDate);
      const daysAgo = daysBetween(releaseDate);

      const lastSent = sheetData[id]?.["last-sent"];

      const questions: string[] = FIELDS.questions.map((question) =>
        record.get(question)
      );

      console.log(daysAgo, lastSent, questions);
    });

    nextPage();
  });
};

script();
