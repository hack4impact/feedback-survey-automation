// Externals
import { sheets_v4 } from "googleapis";

// Internals
import { SPREADSHEET_ID } from "../../Utils/constants";

export type SheetData = Record<string, Record<string, any>>;

const getSheetData = async (sheets: sheets_v4.Sheets): Promise<SheetData> => {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A1:Z200",
  });

  if (!data.values)
    throw new Error(`No values found for spreadsheet '${SPREADSHEET_ID}'`);

  const headers = data.values[0];

  const sheetData = data.values.slice(1).reduce((obj, row) => {
    return {
      ...obj,
      [row[0]]: row
        .slice(1)
        .reduce(
          (obj, value, i) => ({ ...obj, [headers[i + 1]]: formatValue(value) }),
          {}
        ),
    };
  }, {});

  return sheetData;
};

const formatValue = (value: any): any => {
  if (value === "TRUE") return true;
  if (value === "FALSE") return false;
  return value;
};

export default getSheetData;
