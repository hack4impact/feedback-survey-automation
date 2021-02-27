import { FIELDS, READABLE_TIME_PERIODS } from "../../../../Utils/constants";
import { createRowObject, modifyFormRow } from "../helpers/form-store";
import {
  getProjectData,
  updateProjectSuccessTable,
} from "../helpers/airtable/requests";
import { RowArr, RowObj } from "./types";

// START CONSTANTS
// END CONSTANTS

const SPREADSHEET_ID = process.env.FORM_STORE_SHEET_ID ?? "";

// Checks for new responses and sends follow up emails if no response received for 2 weeks
export const cronTrigger = (): void => {
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
        sendReminder(form, rowObj, i);
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
    if (process.env.DRY_RUN === `false`) {
      MailApp.sendEmail(recipient, subject, body);
    }
    Logger.log(`Sending error email to ${recipient} about form ${title}`);
  }
};

const sendReminder = (
  form: GoogleAppsScript.Forms.Form,
  row: RowObj,
  index: number
) => {
  const { projectId, timePeriod } = row;

  const { fields } = getProjectData(projectId);
  // const to = fields[FIELDS.representativeEmail];
  // const nonprofitName = fields[FIELDS.nonprofitName];
  // const subject = `Reminder: Please send the feedback survey to ${nonprofitName}`;
  const template = HtmlService.createTemplateFromFile(
    "static/remind-mail.html"
  );

  for (const field in FIELDS) {
    template[field] = fields[FIELDS[field]];
  }
  template["readableTimePeriod"] = READABLE_TIME_PERIODS[timePeriod];
  template["formPublishedURL"] = form.getPublishedUrl();

  const fullTemplate = template.evaluate().getContent();

  if (process.env.DRY_RUN === `false`) {
    MailApp.sendEmail({
      subject: `Follow Up: Feedback Reminder for ${fields[FIELDS.projectName]}`,
      htmlBody: fullTemplate,
      to: fields[FIELDS.representativeEmail],
      cc: fields[FIELDS.chapterEmail],
    });
    Logger.log(
      `Sending two week reminder email to: ${
        fields[FIELDS.representativeEmail]
      } for project: ${fields[FIELDS.projectName]}`
    );
  }

  row.responded = "Reminder Sent";

  modifyFormRow(row, index);
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