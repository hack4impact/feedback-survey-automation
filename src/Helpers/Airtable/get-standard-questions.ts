// Externals
import Airtable from "airtable";
import { default as AirtableRecord } from "airtable/lib/record";

const getStandardQuestions = (
  table: ReturnType<typeof Airtable.base>
): Promise<AirtableRecord[]> => {
  return new Promise((resolve, reject) => {
    const standardQuestions: AirtableRecord[] = [];

    table("Standard Questions")
      .select()
      .eachPage(
        (questions, nextPage) => {
          for (const question of questions) {
            standardQuestions.push(question);
          }
          nextPage();
        },
        (err) => {
          if (err) reject(err);
          resolve(standardQuestions);
        }
      );
  });
};

export default getStandardQuestions;
