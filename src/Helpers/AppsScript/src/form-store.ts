import { Row } from "./time-based-trigger";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

export const getFormStore = (desiredFormId: string): Row => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as Row[];
  for (let i = 0; i < data.length; i++) {
    const [formId] = data[i];
    if (formId == desiredFormId) {
      return data[i] as Row;
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

  const index = rowIndex + 2;

  const rangeNotation = `A${index}:${
    // +2 because 0 based index and the 1st row is column names (doesn't count)
    getLetterNumerically(numberOfCols - 1) + index
  }`;

  const range = idStore.getRange(rangeNotation);
  return range.setValues([row]);
};

export const getLetterNumerically = (num: number): string => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return LETTERS[num];
};
