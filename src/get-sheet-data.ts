// Externals
import { google } from "googleapis";

// Internals
import initializeAuth from "./Config/google-auth";
import { SPREADSHEET_ID } from "./Utils/constants";

type SheetData = Record<string, Record<string, string>>;

const getSheetData = async (): Promise<SheetData> => {
  const auth = await initializeAuth();

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A1:Z200",
  });

  if (!data.values)
    throw new Error(`No values found for spreadsheet '${SPREADSHEET_ID}'`);

  const headers = data.values[0];

  const sheetData = data.values.slice(1).reduce((obj, row) => {
    const newObj = { ...obj };

    newObj[row[0]] = row.slice(1).reduce((obj, value, i) => {
      const newObj = { ...obj };

      newObj[headers[i + 1]] = value;

      return newObj;
    }, {});

    return newObj;
  }, {});

  return sheetData;
};

export default getSheetData;
