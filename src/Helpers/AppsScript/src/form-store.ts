import { TimePeriod } from "../../../Utils/types";
import { Row } from "./time-based-trigger";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

type RowSliced = [string, TimePeriod];

export const getFormStore = (desiredFormId: string): RowSliced => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as Row[];
  for (let i = 0; i < data.length; i++) {
    const [formId] = data[i];
    if (formId == desiredFormId) {
      return data[i].slice(1) as RowSliced;
    }
  }
  throw new Error(`Unable to find Project ID for Form ID ${desiredFormId}`);
};

export const storeForm = (row: Row): void => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  idStore.appendRow(row);
};

export const modifyFormRow = (
  row: Row,
  rowIndex: number
): GoogleAppsScript.Spreadsheet.Range => {
  const numberOfCols = row.length;
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);

  const rangeNotation = `A${rowIndex}:${
    // +2 because 0 based index and the 1st row is column names (doesn't count)
    getLetterNumerically(numberOfCols - 1) + rowIndex + 2
  }`;

  const range = idStore.getRange(rangeNotation);
  return range.setValues([row]);
};

export const getLetterNumerically = (num: number): string => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return LETTERS[num];
};
