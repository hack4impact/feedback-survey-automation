// Externals
import { config } from "dotenv-safe";
config();
import yargs from "yargs/yargs";
import Airtable from "airtable";
import moment from "moment";

// Internals
import createGoogleForm from "./createGoogleForm";
import { FIELDS } from "./Utils/constants";
import googleSheets from "./google-sheets";
import sendMail from "./sendMail";

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
  const {editUrl, publishedUrl} = await createGoogleForm("Test 2", "5 Months", ["How satisfied are you i=with the product?", "Any Crashes?"]);
  await googleSheets();
  await sendMail("sd7843@pleasantonusd.net", publishedUrl, 0);

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
          // console.log("Retrieved", record.get("Project Name"));
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
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
