import { log_date_store, organized_log_data } from "./index";
import { LogLabel } from "../get-form-responses/index";
import { LogLabel as AppsScriptLogsLabel } from "../../../../Utils/types";

export const getDataFromFiles = (logs: log_date_store[]): log_date_store[] => {
  logs.map(({ date, files }) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as GoogleAppsScript.Drive.File;
      files[i] = JSON.parse(file.getBlob().getDataAsString());
    }
    return { date, files };
  });
  return logs;
};

export const spread_log_data = (logs: log_date_store[]): log_date_store[] => {
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
