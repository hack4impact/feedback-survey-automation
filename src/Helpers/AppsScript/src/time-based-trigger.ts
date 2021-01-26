import { modifyFormRow } from "./form-store";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

type Row = [string, string, string, string, RespondedStatus];
type RespondedStatus = "Yes" | "No" | "Expired";

const cronTrigger = () => {
  checkForNewResponses();
};

const checkForNewResponses = () => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:E1500").getValues() as Row[];
  const notRespondedToYet = data.filter((val) => val[4] === "No");

  notRespondedToYet.forEach((row, index) => {
    const [formId, projectId, something, sentDateString, responded] = row;
    const form = FormApp.openById(formId);
    const formResponses = form.getResponses();
    const sentDate = new Date(sentDateString);
    const currentDate = new Date();
    if (formResponses.length >= 1) {
      try {
        //add to airtable - should take in form, response, formId, projectId
        const newRow: Row = [
          formId,
          projectId,
          something,
          sentDateString,
          "Yes",
        ];
        modifyFormRow(index + 1, newRow);
      } catch (e) {
        Logger.log(`Error - ${e}`);
      }
    } else if (hasItBeenXMonths(6, currentDate, sentDate)) {
      const newRow: Row = [
        formId,
        projectId,
        something,
        sentDateString,
        "Expired",
      ];
      modifyFormRow(index + 1, newRow);
    }
  });
};

const hasItBeenXMonths = (
  months: number,
  currentDate: Date,
  sentDate: Date
) => {
  return currentDate.getTime() > sentDate.getTime() + months * 2629746000;
};
