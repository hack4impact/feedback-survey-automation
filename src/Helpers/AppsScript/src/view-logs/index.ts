import { getAllDatesInRange } from "./date-helpers";

export const doGet = (request: GoogleAppsScript.Events.DoGet): void => {
  // if (!request.parameters["password"] || request.parameters["password"] !== process.env.APPS_SCRIPT_PASSWORD) {
  //   return;
  // }

  const date = request.parameters["date"];
  const start_date = request.parameters["start"];
  const end_date = request.parameters["end"];

  if (validateDateFormat(date)) {
    const files = findFiles([date]);
    let string = "";
    for (const file of files) {
      string += file.getName() + "     " + "\n" + "       ";
    }
    ContentService.createTextOutput().append(string);
    return;
  } else if (validateDateFormat(start_date) && validateDateFormat(end_date)) {
    const files = findFiles([date]);
    let string = "";
    for (const file of files) {
      string += file.getName() + "     " + "\n" + "       ";
    }
    ContentService.createTextOutput().append(string);
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
): GoogleAppsScript.Drive.File[] => {
  if (!dates || dates.length === 0 || dates.length > 2) {
    return [];
  }

  const singleDate: string | false = dates.length === 1 ? dates[0] : false;
  const files: GoogleAppsScript.Drive.File[] = [];
  const logs_folder = DriveApp.getFolderById(process.env.LOGS_FOLDER as string);

  if (singleDate) {
    const file_iterator = logs_folder.getFilesByName(singleDate);
    while (file_iterator.hasNext()) {
      const file = file_iterator.next();
      files.push(file);
    }
    return files;
  } else {
    const allDates = getAllDatesInRange(dates[0], dates[1]);
    for (const date of allDates) {
      const file_iterator = logs_folder.getFilesByName(date);
      while (file_iterator.hasNext()) {
        const file = file_iterator.next();
        files.push(file);
      }
    }
    return files;
  }
};
