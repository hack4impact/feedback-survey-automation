import { RowArr, RowObj } from "../get-form-responses/types";

export const getFormStore = (desiredFormId: string): RowObj => {
  const idStore = SpreadsheetApp.openById(
    process.env.FORM_STORE_SHEET_ID as string
  );
  const data = idStore.getRange("A2:F1500").getValues();

  for (let i = 0; i < data.length; i++) {
    const [formId] = data[i];
    if (formId == desiredFormId) {
      return createRowObject(data[i] as RowArr);
    }
  }
  throw new Error(`Unable to find Project ID for Form ID ${desiredFormId}`);
};

export const storeForm = (row: RowObj): void => {
  const idStore = SpreadsheetApp.openById(
    process.env.FORM_STORE_SHEET_ID as string
  );
  idStore.appendRow(createRowArray(row));
};

export const modifySheetRow = (
  row: RowObj,
  rowIndex: number
): GoogleAppsScript.Spreadsheet.Range => {
  const rowArr = createRowArray(row);
  const numberOfCols = rowArr.length;
  const idStore = SpreadsheetApp.openById(
    process.env.FORM_STORE_SHEET_ID as string
  );

  const index = rowIndex + 2;

  const rangeNotation = `A${index}:${
    // +2 because 0 based index and the 1st row is column names (doesn't count)
    getLetterNumerically(numberOfCols - 1) + index
  }`;

  const range = idStore.getRange(rangeNotation);
  return range.setValues([rowArr]);
};

export const getLetterNumerically = (num: number): string => {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return LETTERS[num];
};

export const createRowArray = (obj: RowObj): RowArr => {
  return [
    obj.formId,
    obj.projectId,
    obj.timePeriod,
    obj.sentDate,
    obj.responded,
    obj.formEditLink,
  ];
};

export const createRowObject = (arr: RowArr): RowObj => {
  return {
    formId: arr[0],
    projectId: arr[1],
    timePeriod: arr[2],
    sentDate: arr[3],
    responded: arr[4],
    formEditLink: arr[5],
  };
};
