// Externals
import { sheets_v4 } from "googleapis";

// Internals
import { SPREADSHEET_ID } from "../../Utils/constants";
import { TimePeriod, TIME_PERIODS } from "../../Utils/types";
import { SheetData } from "./get-sheet-data";

const setSheetData = async (
  sheets: sheets_v4.Sheets,
  id: string,
  surveyCreated: TimePeriod,
  sheetData?: SheetData[string]
): Promise<void> => {
  if (sheetData) {
    //TODO: Update values
  } else await appendCells(sheets, id, surveyCreated);
};

const appendCells = async (
  sheets: sheets_v4.Sheets,
  id: string,
  surveyCreated: TimePeriod
) => {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          appendCells: {
            fields: "*",
            rows: [
              {
                values: [idCell(id), ...timePeriods(surveyCreated)],
              },
            ],
          },
        },
      ],
    },
  });
};

const idCell = (id: string) => ({
  formattedValue: id,
  effectiveValue: {
    stringValue: id,
  },
  userEnteredValue: {
    stringValue: id,
  },
});

const timePeriods = (surveyCreated: TimePeriod) =>
  Object.keys(TIME_PERIODS).map((timePeriod) =>
    boolValue(timePeriod === surveyCreated)
  );

const boolValue = (bool: boolean) => {
  return {
    userEnteredValue: {
      boolValue: bool,
    },
    formattedValue: bool ? "TRUE" : "FALSE",
  };
};

export default setSheetData;
