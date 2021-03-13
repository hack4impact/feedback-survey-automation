import {
  getAllDatesInRange,
  parseDateFromUrlForm,
  validateDateFormat,
} from "./misc-helpers";
import { getDataFromFiles, spread_log_data } from "./data-helpers";
import { createStringDate } from "../helpers/misc";

export type log_date_store = {
  date: string;
  files: GoogleAppsScript.Drive.File[] | any[][] | any;
};

export type organized_log_data = {
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
  const template = HtmlService.createTemplateFromFile(templatePath);

  let filtered_data: log_date_store[];

  if (validateDateFormat(date)) {
    const logs: log_date_store[] = findFiles([date]);
    const logs_with_data = getDataFromFiles(logs);
    filtered_data = spread_log_data(logs_with_data);
    template.start_date = date;
    template.end_date = undefined;
  } else if (validateDateFormat(start_date) && validateDateFormat(end_date)) {
    const logs: log_date_store[] = findFiles([start_date, end_date]);
    const logs_with_data = getDataFromFiles(logs);
    filtered_data = spread_log_data(logs_with_data);
    template.start_date = start_date;
    template.end_date = end_date;
  } else {
    const today = createStringDate(new Date());
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
    const sevenDaysAgo = createStringDate(sevenDaysAgoDate);
    const logs: log_date_store[] = findFiles([sevenDaysAgo, today]);
    const logs_with_data = getDataFromFiles(logs);
    filtered_data = spread_log_data(logs_with_data);
    template.start_date = sevenDaysAgo;
    template.end_date = today;
  }

  const sevenBeforeStart = parseDateFromUrlForm(
    template.start_date as string
  ) as Date;
  sevenBeforeStart.setDate(sevenBeforeStart.getDate() - 7);

  const oneBeforeStart = parseDateFromUrlForm(
    template.start_date as string
  ) as Date;
  oneBeforeStart.setDate(oneBeforeStart.getDate() - 1);

  const prevLogs = findFiles([
    createStringDate(sevenBeforeStart),
    createStringDate(oneBeforeStart),
  ]);

  template.prev_logs = prevLogs;
  template.logs_per_day = filtered_data;
  return template
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
};

//date format must be (YYYY-MM-DD)

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
    if (log_files.length > 0) {
      store.push({ date: singleDate, files: log_files });
    }
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

  return store.reverse();
};
