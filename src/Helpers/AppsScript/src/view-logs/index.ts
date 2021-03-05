import { getAllDatesInRange } from "./date-helpers";
import { LogLabel } from "../get-form-responses/index";
import { LogLabel as AppsScriptLogsLabel } from "../../../../Utils/types";

type log_date_store = {
  date: string;
  files: GoogleAppsScript.Drive.File[] | any[][] | any;
};
type organized_log_data = {
  date: string;
  warnings: Record<string, unknown>[];
  errors: Record<string, unknown>[];
  forms_created: Record<string, unknown>[];
  follow_ups_sent: Record<string, unknown>[];
  responses_uploaded: Record<string, unknown>[];
  feedback_reminders_sent: Record<string, unknown>[];
  other: Record<string, unknown>[];
};

export const doGet = (request: GoogleAppsScript.Events.DoGet): any => {
  // if (!request.parameters["password"] || request.parameters["password"] !== process.env.APPS_SCRIPT_PASSWORD) {
  //   return;
  // }

  const date = Array.isArray(request.parameters["date"])
    ? request.parameters["date"][0]
    : undefined;
  const start_date = Array.isArray(request.parameters["start"])
    ? request.parameters["start"][0]
    : undefined;
  const end_date = Array.isArray(request.parameters["end"])
    ? request.parameters["end"][0]
    : undefined;
  const templatePath = "src/view-logs/static/index";

  let filtered_data: log_date_store[];

  if (validateDateFormat(date)) {
    const logs: log_date_store[] = findFiles([date]);
    const logs_with_data = getDataFromFiles(logs);
    filtered_data = spread_log_data(logs_with_data);
  } else if (validateDateFormat(start_date) && validateDateFormat(end_date)) {
    const logs: log_date_store[] = findFiles([start_date, end_date]);
    const logs_with_data = getDataFromFiles(logs);
    filtered_data = spread_log_data(logs_with_data);
  } else {
    return;
  }

  Logger.log(filtered_data);

  const template = HtmlService.createTemplateFromFile(templatePath);
  template.logs_per_day = filtered_data;
  return template.evaluate();
};

//date format must be (YYYY-MM-DD)
const validateDateFormat = (date: string | undefined) => {
  if (!date) return false;
  const regex = RegExp(
    /^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$/
  );
  return regex.test(date);
};

const findFiles = (dates: string[] | undefined): log_date_store[] => {
  if (!dates || dates.length === 0 || dates.length > 2) {
    return [];
  }

  const singleDate: string | false = dates.length === 1 ? dates[0] : false;
  const store: log_date_store[] = [];

  const main_logs_folder = DriveApp.getFolderById(
    process.env.MAIN_LOGS_FOLDER as string
  );
  const apps_script_logs_folder = DriveApp.getFolderById(
    process.env.APPS_SCRIPT_LOGS_FOLDER as string
  );

  if (singleDate) {
    const log_files: GoogleAppsScript.Drive.File[] = [];
    let file_iterator = main_logs_folder.getFilesByName(`${singleDate}.json`);
    while (file_iterator.hasNext()) {
      const file = file_iterator.next();
      log_files.push(file);
    }

    file_iterator = apps_script_logs_folder.getFilesByName(
      `${singleDate}.json`
    );
    while (file_iterator.hasNext()) {
      const file = file_iterator.next();
      log_files.push(file);
    }
    store.push({ date: singleDate, files: log_files });
  } else {
    const allDates = getAllDatesInRange(dates[0], dates[1]);
    for (const date of allDates) {
      const log_files: GoogleAppsScript.Drive.File[] = [];
      let file_iterator = main_logs_folder.getFilesByName(`${date}.json`);
      while (file_iterator.hasNext()) {
        const file = file_iterator.next();
        log_files.push(file);
      }

      file_iterator = apps_script_logs_folder.getFilesByName(`${date}.json`);
      while (file_iterator.hasNext()) {
        const file = file_iterator.next();
        log_files.push(file);
      }

      if (log_files.length != 0) {
        store.push({ date, files: log_files });
      }
    }
  }

  return store;
};

const getDataFromFiles = (logs: log_date_store[]): log_date_store[] => {
  logs.map(({ date, files }) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as GoogleAppsScript.Drive.File;
      files[i] = JSON.parse(file.getBlob().getDataAsString());
    }
    return { date, files };
  });
  return logs;
};

const spread_log_data = (logs: log_date_store[]): log_date_store[] => {
  const spread_data: log_date_store[] = [];
  for (const log of logs) {
    const new_data: organized_log_data = {
      date: log.date,
      warnings: [],
      errors: [],
      feedback_reminders_sent: [],
      follow_ups_sent: [],
      responses_uploaded: [],
      forms_created: [],
      other: [],
    };
    const files = log.files as any[][];

    for (const file of files) {
      for (const output of file) {
        const label: LogLabel | AppsScriptLogsLabel | undefined =
          output.extra?.label || undefined;
        if (output.type === "error") {
          new_data.errors.push(output);
        } else if (output.type === "warn") {
          new_data.warnings.push(output);
        } else if (label && label === "googleFormCreated") {
          new_data.forms_created.push(output);
        } else if (label && label === "reminderSent") {
          new_data.feedback_reminders_sent.push(output);
        } else if (label && label === "twoWeekReminderEmailSent") {
          new_data.follow_ups_sent.push(output);
        } else if (label && label === "successTableUpdated") {
          new_data.responses_uploaded.push(output);
        } else {
          new_data.other.push(output);
        }
      }
    }

    const log_date_store = { date: log.date, files: new_data };
    spread_data.push(log_date_store);
  }
  return spread_data;
};
