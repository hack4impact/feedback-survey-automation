import { TimePeriod } from "../../../Utils/types";
import { getProjectData } from "./airtable/requests";
import { createRowObject, modifyFormRow } from "./form-store";
import { updateProjectSuccessTable } from "./main";

// START FIELDS
// END FIELDS

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

type FormID = string;

type ProjectID = string;

type SentDate = number;

type RespondedStatus = "Yes" | "No" | "Reminder Sent" | "Expired";

type FormEditLink = string;

export type RowArr = [
  FormID,
  ProjectID,
  TimePeriod,
  SentDate,
  RespondedStatus,
  FormEditLink
];

export interface RowObj {
  formId: FormID;
  projectId: ProjectID;
  timePeriod: TimePeriod;
  sentDate: SentDate;
  responded: RespondedStatus;
  formEditLink: FormEditLink;
}

// Checks for new responses and sends follow up emails if no response recieved for 2 weeks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronTrigger = () => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as RowArr[];

  data.forEach((row, i) => {
    const rowObj = createRowObject(row);
    const { formId, responded, sentDate } = rowObj;

    if (responded === "No" || responded === "Reminder Sent") {
      const form = FormApp.openById(formId);
      const formResponses = form.getResponses();

      if (formResponses.length > 0) onResponse(form, formResponses, rowObj, i);
      else if (hasItBeenXWeeks(2, sentDate) && responded === "No")
        sendReminder(rowObj, i);
      else if (hasItBeenXMonths(6, sentDate)) formExpired(rowObj, i);
    }
  });
};

const onResponse = (
  form: GoogleAppsScript.Forms.Form,
  formResponses: GoogleAppsScript.Forms.FormResponse[],
  row: RowObj,
  index: number
) => {
  try {
    updateProjectSuccessTable(form, formResponses[0]);

    row.responded = "Yes";

    modifyFormRow(row, index);
  } catch (e) {
    const title = form.getTitle();
    Logger.log(`An error occurred for form '${title}' (${e})`);

    const recipient = process.env.UPLOAD_ERROR_EMAIL as string;
    const subject = `Unable to process ${title}.`;
    const body = `There was an error in adding the responses of this form to the Project Success Data airtable. The error was: \n\t${e}\nHere is the link to the form edit url: ${row.formEditLink}\n\nPlease manually upload the response to the airtable.`;

    form.addEditor(recipient);
    // MailApp.sendEmail(recipient, subject, body);
    Logger.log(`sending mail ${recipient} ${subject} ${body}`);
  }
};

const sendReminder = (row: RowObj, index: number) => {
  const { projectId } = row;

  const { fields } = getProjectData(projectId);
  const to = fields["Representative Email"];
  const nonprofitName = fields["Nonprofit Partner Name"] as string;
  const subject = `Reminder: Please send the feedback survey to ${nonprofitName}`;
  const template = HtmlService.createTemplateFromFile(
    "static/remind-mail.html"
  );

  Logger.log(template.getCode());

  // MailApp.sendEmail({
  //   subject,
  //   body: "",
  //   htmlBody: "",
  //   to,
  // });

  Logger.log(`sending mail ${to} ${subject}`);

  // Responded: Reminder Sent
  row[4] = "Reminder Sent";

  // modifyFormRow(row, index);
};

const formExpired = (row: RowObj, index: number) => {
  // Responded: Expired
  row.responded = "Expired";

  modifyFormRow(row, index);
};

const hasItBeenXMonths = (months: number, sentDate: number) => {
  return Date.now() > sentDate + months * 2629746000;
};

const hasItBeenXWeeks = (weeks: number, sentDate: number) => {
  return Date.now() > sentDate + weeks * 604800000;
};
