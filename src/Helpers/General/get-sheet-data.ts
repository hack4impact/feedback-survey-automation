// Externals
import { google } from "googleapis";

// Internals
import initializeAuth from "../../Config/google-auth";

export type SheetData = Record<string, Record<string, string>>;

const getSheetData = async (sheetId: string): Promise<SheetData> => {
  const auth = await initializeAuth();

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A1:Z200",
  });

  if (!data.values)
    throw new Error(`No values found for spreadsheet '${sheetId}'`);

  const headers = data.values[0];

  const sheetData = data.values.slice(1).reduce((obj, row) => {
    return {
      ...obj,
      [row[0]]: row
        .slice(1)
        .reduce((obj, value, i) => ({ ...obj, [headers[i + 1]]: value }), {}),
    };
  }, {});

  return sheetData;
};

export default getSheetData;
