import { getAllDatesInRange } from "./date-helpers";

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

  if (validateDateFormat(date)) {
    const files = findFiles([date]);
    const logsToReturn: { main_logs: any[]; apps_script_logs: any[] } = {
      main_logs: [],
      apps_script_logs: [],
    };
    for (const file of files.main_logs) {
      logsToReturn.main_logs.push(JSON.parse(file.getBlob().getDataAsString()));
    }
    for (const file of files.apps_script_logs) {
      logsToReturn.apps_script_logs.push(
        JSON.parse(file.getBlob().getDataAsString())
      );
    }
    const template = HtmlService.createTemplateFromFile(templatePath);
    return template.evaluate();
  } else if (validateDateFormat(start_date) && validateDateFormat(end_date)) {
    const files = findFiles([start_date, end_date]);
    const logsToReturn: { main_logs: any[]; apps_script_logs: any[] } = {
      main_logs: [],
      apps_script_logs: [],
    };
    for (const file of files.main_logs) {
      logsToReturn.main_logs.push(JSON.parse(file.getBlob().getDataAsString()));
    }
    for (const file of files.apps_script_logs) {
      logsToReturn.apps_script_logs.push(
        JSON.parse(file.getBlob().getDataAsString())
      );
    }
    const template = HtmlService.createTemplateFromFile(templatePath);
    return template.evaluate();
  } else {
    return;
  }
};

//date format must be (YYYY-MM-DD)
const validateDateFormat = (date: string | undefined) => {
  if (!date) return false;
  const regex = RegExp(
    /^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$/
  );
  return regex.test(date);
};

const findFiles = (
  dates: string[] | undefined
): {
  main_logs: GoogleAppsScript.Drive.File[];
  apps_script_logs: GoogleAppsScript.Drive.File[];
} => {
  if (!dates || dates.length === 0 || dates.length > 2) {
    return { main_logs: [], apps_script_logs: [] };
  }

  const singleDate: string | false = dates.length === 1 ? dates[0] : false;
  const main_log_files: GoogleAppsScript.Drive.File[] = [],
    apps_script_log_files = [];
  const main_logs_folder = DriveApp.getFolderById(
    process.env.MAIN_LOGS_FOLDER as string
  );
  const apps_script_logs_folder = DriveApp.getFolderById(
    process.env.APPS_SCRIPT_LOGS_FOLDER as string
  );

  if (singleDate) {
    let file_iterator = main_logs_folder.getFilesByName(`${singleDate}.json`);
    while (file_iterator.hasNext()) {
      const file = file_iterator.next();
      main_log_files.push(file);
    }

    file_iterator = apps_script_logs_folder.getFilesByName(
      `${singleDate}.json`
    );
    while (file_iterator.hasNext()) {
      const file = file_iterator.next();
      apps_script_log_files.push(file);
    }
  } else {
    const allDates = getAllDatesInRange(dates[0], dates[1]);
    for (const date of allDates) {
      let file_iterator = main_logs_folder.getFilesByName(`${date}.json`);
      while (file_iterator.hasNext()) {
        const file = file_iterator.next();
        main_log_files.push(file);
      }

      file_iterator = apps_script_logs_folder.getFilesByName(`${date}.json`);
      while (file_iterator.hasNext()) {
        const file = file_iterator.next();
        apps_script_log_files.push(file);
      }
    }
  }

  return {
    main_logs: main_log_files,
    apps_script_logs: apps_script_log_files,
  };
};
