const SPREADSHEET_ID = "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getProjectId = (desiredFormId: string) => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data: string[][] = idStore.getRange("A1:B1500").getValues();
  for (let i = 0; i < data.length; i++) {
    const [formId, projectId] = data[i];
    if (formId == desiredFormId) {
      return projectId;
    }
  }
  throw new Error(`Unable to find Project ID for Form ID ${desiredFormId}`);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addRowToIdStore = (formId: string, projectId: string) => {
  const idStore = SpreadsheetApp.openById(SPREADSHEET_ID);
  idStore.appendRow([formId, projectId]);
};
