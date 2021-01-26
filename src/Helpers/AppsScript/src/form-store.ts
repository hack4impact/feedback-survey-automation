import { TimePeriod } from "../../../Utils/types";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

type RowSliced = [string, TimePeriod];
type Row = [string, ...RowSliced];

export const getFormStore = (desiredFormId: string): RowSliced => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:C1500").getValues() as Row[];
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

export const modifyFormRow = (rowIndex: number, values: Array<string>) => {
  const numberOfCols = values.length;
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rangeNotation = `A${rowIndex}:${
    getLetterNumerically(numberOfCols) + rowIndex
  }`;
  const range = idStore.getRange(rangeNotation);
  range.setValues([values]);
};

export const getLetterNumerically = (num: number) => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return LETTERS[num];
};
