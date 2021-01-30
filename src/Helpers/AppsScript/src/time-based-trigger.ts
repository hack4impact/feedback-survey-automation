import { TimePeriod } from "../../../Utils/types";
import { getProjectData } from "./airtable/requests";
import { modifyFormRow } from "./form-store";
import { updateProjectSuccessTable } from "./main";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

type FormID = string;

type ProjectID = string;

type SentDate = number;

type RespondedStatus = "Yes" | "No" | "Reminder Sent" | "Expired";

type FormEditLink = string;

export type Row = [
  FormID,
  ProjectID,
  TimePeriod,
  SentDate,
  RespondedStatus,
  FormEditLink
];

// Checks for new responses and sends follow up emails if no response recieved for 2 weeks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronTrigger = () => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as Row[];

  const notRespondedToYet = data.filter(
    (row) => row[4] === "No" || row[4] === "Reminder Sent"
  );

  notRespondedToYet.forEach((row, i) => {
    const [formId, , , sentDate, responded] = row;

    const form = FormApp.openById(formId);
    const formResponses = form.getResponses();

    if (formResponses.length >= 1) onResponse(form, formResponses, row, i);
    else if (hasItBeenXWeeks(2, sentDate) && responded === "No")
      sendReminder(row, i);
    else if (hasItBeenXMonths(6, sentDate)) formExpired(row, i);
  });
};

const onResponse = (
  form: GoogleAppsScript.Forms.Form,
  formResponses: GoogleAppsScript.Forms.FormResponse[],
  row: Row,
  index: number
) => {
  try {
    updateProjectSuccessTable(form, formResponses[0]);

    // Responded: Yes
    row[4] = "Yes";

    modifyFormRow(row, index);
  } catch (e) {
    const recipient = "sd7843@pleasantonusd.net";
    const subject = `Unable to process form ${row[0]}.`; // row[0]: formId
    const body = `There was an error in adding the response to this form into the airtable. The error was: \n ${e} \n Here is the link to the form edit url: ${row[5]} \n \n Please manually upload the response to the airtable.`; // row[5]: formEditLink

    MailApp.sendEmail(recipient, subject, body);

    throw new Error(`Error - ${e}`);
  }
};

const sendReminder = (row: Row, index: number) => {
  const [, projectId, timePeriod] = row;

  const projectData = getProjectData(projectId);
  const recipient = projectData.fields["Representative Email"] as string; // will probably change
  const nonprofitName = projectData.fields["Nonprofit Partner Name"] as string;
  const subject = `Reminder: Please send the ${timePeriod} survey to ${nonprofitName}`;
  const body = `We haven't recieved a reponse from ${nonprofitName} yet. Please do so within the next couple of weeks. Otherwise, Nationals won't be happy. If you have already sent the survey, you can ignore this email.`;

  MailApp.sendEmail(recipient, subject, body);

  // Responded: Reminder Sent
  row[4] = "Reminder Sent";

  modifyFormRow(row, index);
};

const formExpired = (row: Row, index: number) => {
  // Responded: Expired
  row[4] = "Expired";

  modifyFormRow(row, index);
};

const hasItBeenXMonths = (months: number, sentDate: number) => {
  return Date.now() > sentDate + months * 2629746000;
};

const hasItBeenXWeeks = (weeks: number, sentDate: number) => {
  return Date.now() > sentDate + weeks * 604800000;
};
