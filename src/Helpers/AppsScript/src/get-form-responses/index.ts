import { Log, LogType } from "@hack4impact/logger";
import { FIELDS, READABLE_TIME_PERIODS } from "../../../../Utils/constants";
import { createRowObject, modifySheetRow } from "../helpers/form-store";
import {
  getProjectData,
  updateProjectSuccessTable,
} from "../helpers/airtable/requests";
import { RowArr, RowObj } from "./types";

// START CONSTANTS
// END CONSTANTS

export type LogLabel =
  | "successTableUpdated"
  | "sheetRespondedYes"
  | "uploadError"
  | "uploadErrorEmailSent"
  | "twoWeekReminderEmailSent"
  | "sheetRespondedReminderSent"
  | "sheetRespondedExpired";

const SPREADSHEET_ID = process.env.FORM_STORE_SHEET_ID ?? "";
const logs: Log[] = [];

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

  finish();
};

interface LogExtra extends Record<string, any> {
  label: LogLabel;
}

const logAndWrite = (message: string, type: LogType, extra: LogExtra) => {
  Logger.log(message);
  logs.push({
    index: logs.length,
    message,
    timestamp: Date.now(),
    type,
    extra,
  });
};

const finish = () => {
  if (process.env.DRY_RUN !== `false`) {
    Logger.log("Dry run completed");
  } else {
    DriveApp.getFolderById(
      process.env.APPS_SCRIPT_LOGS_FOLDER as string
    ).createFile(
      createFileName(),
      JSON.stringify(logs, undefined, 2),
      "application/json"
    );
    Logger.log("Uploaded logs to Google Drive");
  }
  Logger.log(`Logs: ${JSON.stringify(logs)}`);
};

const createFileName = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const date = ("0" + currentDate.getDate()).slice(-2);

  return `${year}-${month}-${date}.json`;
};

const onResponse = (
  form: GoogleAppsScript.Forms.Form,
  formResponses: GoogleAppsScript.Forms.FormResponse[],
  row: RowObj,
  index: number
) => {
  try {
    if (process.env.DRY_RUN === `false`) {
      updateProjectSuccessTable(form, formResponses[0]);
    }
    logAndWrite(
      `Project success table updated with '${form.getTitle()}'`,
      "success",
      {
        label: "successTableUpdated",
      }
    );

    row.responded = "Yes";

    if (process.env.DRY_RUN === `false`) {
      modifySheetRow(row, index);
    }
    logAndWrite(
      `Modified sheet row #${index} with responded = '${row.responded}'`,
      "success",
      {
        label: "sheetRespondedYes",
      }
    );
  } catch (e) {
    const title = form.getTitle();
    logAndWrite(`An error occurred for "${title}"`, "error", {
      error: typeof e === "string" ? e : e.message,
      label: "uploadError",
    });

    const recipient = process.env.UPLOAD_ERROR_EMAIL as string;
    const subject = `Unable to process ${title}.`;
    const email = `There was an error in adding the responses of this form to the Project Success Data airtable. The error was: \n\t${e}\nHere is the link to the form edit url: ${row.formEditLink}\n\nPlease manually upload the response to the AirTable.`;

    if (process.env.DRY_RUN === `false`) {
      form.addEditor(recipient);
      MailApp.sendEmail(recipient, subject, email);
    }
    logAndWrite(
      `Sent error email to ${recipient} about '${title}'`,
      "success",
      {
        email,
        subject,
        recipient,
        label: "uploadErrorEmailSent",
      }
    );
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

  const email = template.evaluate().getContent();
  const subject = `Follow Up: Feedback Reminder for ${
    fields[FIELDS.projectName]
  }`;

  if (process.env.DRY_RUN === `false`) {
    MailApp.sendEmail({
      subject,
      htmlBody: email,
      to: fields[FIELDS.representativeEmail],
      cc: fields[FIELDS.chapterEmail],
    });
  }
  logAndWrite(
    `Sent two week reminder email to: ${
      fields[FIELDS.representativeEmail]
    } for project: ${fields[FIELDS.projectName]}`,
    "success",
    { email, subject, label: "twoWeekReminderEmailSent" }
  );

  row.responded = "Reminder Sent";
  if (process.env.DRY_RUN === `false`) {
    modifySheetRow(row, index);
  }
  logAndWrite(
    `Modified sheet row #${index} with responded = '${row.responded}'`,
    "success",
    { label: "sheetRespondedReminderSent" }
  );
};

const formExpired = (row: RowObj, index: number) => {
  // Responded: Expired
  row.responded = "Expired";

  if (process.env.DRY_RUN === `false`) {
    modifySheetRow(row, index);
  }
  logAndWrite(
    `Modified sheet row #${index} with responded = '${row.responded}'`,
    "success",
    { label: "sheetRespondedExpired" }
  );
};

const hasItBeenXMonths = (months: number, sentDate: number) => {
  return Date.now() > sentDate + months * 2629746000;
};

const hasItBeenXWeeks = (weeks: number, sentDate: number) => {
  return Date.now() > sentDate + weeks * 604800000;
};
