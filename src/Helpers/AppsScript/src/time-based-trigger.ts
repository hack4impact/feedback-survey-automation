import { getProjectData } from "./airtable/requests";
import { modifyFormRow } from "./form-store";
import { updateProjectSuccessTable } from "./main";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

// formId,
// projectId,
// timePeriod,
// sentDateString,
// responded,
// formEditLink

export type Row = [string, string, string, string, RespondedStatus, string];
interface RowWithSheetIndex {
  row: Row;
  sheetIndex: number;
}

type RespondedStatus = "Yes" | "No" | "Reminder Sent" | "Expired";

const cronTrigger = () => {
  checkForNewResponses();
};

const checkForNewResponses = () => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as Row[];

  let notRespondedToYet: Array<RowWithSheetIndex> = [];
  Logger.log(data.slice(0, 8));

  data.forEach((value, index) => {
    const obj: RowWithSheetIndex = {
      row: value,
      sheetIndex: index,
    };
    notRespondedToYet.push(obj);
  });

  notRespondedToYet = notRespondedToYet.filter(
    (val) => val.row[4] === "No" || val.row[4] === "Reminder Sent"
  );
  Logger.log(notRespondedToYet);

  notRespondedToYet.forEach((rowWithSheetIndex) => {
    const [
      formId,
      projectId,
      timePeriod,
      sentDateString,
      responded,
      formEditLink,
    ] = rowWithSheetIndex.row;
    const form = FormApp.openById(formId);
    const formResponses = form.getResponses();
    const sentDate = new Date(sentDateString);
    const currentDate = new Date();
    if (formResponses.length >= 1) {
      try {
        updateProjectSuccessTable(form, formResponses[0]);
        const newRow: Row = [
          formId,
          projectId,
          timePeriod,
          sentDateString,
          "Yes",
          formEditLink,
        ];

        //+2 because 0 based index and sheets 1st row is named, doesn't count
        modifyFormRow(rowWithSheetIndex.sheetIndex + 2, newRow);
      } catch (e) {
        const recipient = "sd7843@pleasantonusd.net";
        const subject = `Unable to process form ${formId}.`;
        const body = `There was an error in adding the response to this form into the airtable. The error was: \n ${e} \n Here is the link to the form edit url: ${formEditLink} \n \n Please manually upload the response to the airtable.`;

        try {
          MailApp.sendEmail(recipient, subject, body);
        } catch (e) {
          Logger.log(`There was an error in sending the error email : ${e}`);
        }
        Logger.log(`Error - ${e}`);
      }
    } else if (
      hasItBeenXWeeks(2, currentDate, sentDate) &&
      responded === "No"
    ) {
      const projectData = getProjectData(projectId);
      const recipient = projectData.fields["Representative Email"] as string; // will probably change
      const nonprofitName = projectData.fields[
        "Nonprofit Partner Name"
      ] as string;
      const subject = `Reminder: Please send the ${timePeriod} survey to ${nonprofitName}`;
      const body = `We haven't recieved a reponse from ${nonprofitName} yet. Please do so within the next couple of weeks. Otherwise, nationals won't be happy. If you have already sent the survey, you can ignore this email.`;

      try {
        MailApp.sendEmail(recipient, subject, body);
      } catch (e) {
        Logger.log(`Unable to send reminder email. Reason: ${e}`);
      }

      const newRow: Row = [
        formId,
        projectId,
        timePeriod,
        sentDateString,
        "Reminder Sent",
        formEditLink,
      ];
      modifyFormRow(rowWithSheetIndex.sheetIndex + 2, newRow);
    } else if (hasItBeenXMonths(6, currentDate, sentDate)) {
      const newRow: Row = [
        formId,
        projectId,
        timePeriod,
        sentDateString,
        "Expired",
        formEditLink,
      ];
      modifyFormRow(rowWithSheetIndex.sheetIndex + 2, newRow);
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

const hasItBeenXWeeks = (weeks: number, currentDate: Date, sentDate: Date) => {
  return currentDate.getTime() > sentDate.getTime() + weeks * 604800000;
};
