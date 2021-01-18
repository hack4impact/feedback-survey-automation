// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";
import moment from "moment";

// Internals
import createGoogleForm from "./createGoogleForm";
import { FIELDS } from "./Utils/constants";
import getSheetData from "./get-sheet-data";

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
  await createGoogleForm();
  const sheetData = await getSheetData();

  const table = Airtable.base("app0TDYnyirqeRk1T");

  table("Projects")
    .select()
    .eachPage(
      (records, nextPage) => {
        // This function (`page`) will get called for each page of records.

        records.forEach((record) => {
          const questions = FIELDS.questions.map((question) =>
            record.get(question)
          );
          const releaseDate = record.get(FIELDS.releaseDate);

          console.log(questions, moment(releaseDate).format("DD-MM-YYYY"));
          console.log(record.fields);
        });

        nextPage();
      },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      }
    );
};

script();
