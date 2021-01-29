import { modifyFormRow } from "./form-store";
import { updateProjectSuccessTable } from "./main";

const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

// formId,
// projectId,
// timePeriod,
// sentDateString,
// responded,
// formEditLink

export type Row = [string, string, string, string, RespondedStatus, string];
interface RowWithSheetIndex {
  row: Row;
  sheetIndex: number;
}

type RespondedStatus = "Yes" | "No" | "Expired";

const cronTrigger = () => {
  checkForNewResponses();
};

const checkForNewResponses = () => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = idStore.getRange("A2:F1500").getValues() as Row[];

  let notRespondedToYet: Array<RowWithSheetIndex> = [];
  Logger.log(data.slice(0, 8));

  data.forEach((value, index) => {
    const obj: RowWithSheetIndex = {
      row: value,
      sheetIndex: index,
    };
    notRespondedToYet.push(obj);
  });

  notRespondedToYet = notRespondedToYet.filter((val) => val.row[4] === "No");
  Logger.log(notRespondedToYet);

  notRespondedToYet.forEach((rowWithSheetIndex) => {
    const [
      formId,
      projectId,
      timePeriod,
      sentDateString,
      responded,
      formEditLink,
    ] = rowWithSheetIndex.row;
    const form = FormApp.openById(formId);
    const formResponses = form.getResponses();
    const sentDate = new Date(sentDateString);
    const currentDate = new Date();
    if (formResponses.length >= 1) {
      try {
        updateProjectSuccessTable(form, formResponses[0]);
        const newRow: Row = [
          formId,
          projectId,
          timePeriod,
          sentDateString,
          "Yes",
          formEditLink,
        ];

        //+2 because 0 based index and sheets 1st row is named, doesn't count
        modifyFormRow(rowWithSheetIndex.sheetIndex + 2, newRow);
      } catch (e) {
        Logger.log(`Error - ${e}`);
      }
    } else if (hasItBeenXMonths(6, currentDate, sentDate)) {
      const newRow: Row = [
        formId,
        projectId,
        timePeriod,
        sentDateString,
        "Expired",
        formEditLink,
      ];
      modifyFormRow(rowWithSheetIndex.sheetIndex + 2, newRow);
    }
  });
};

const hasItBeenXMonths = (
  months: number,
  currentDate: Date,
  sentDate: Date
) => {
  return currentDate.getTime() > sentDate.getTime() + months * 2629746000;
};
