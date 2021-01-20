function getProjectId(desiredFormId: string) {
  const idStore = SpreadsheetApp.openById(
    "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4"
  );
  const data = idStore.getRange("A1:B1500").getValues();
  for (let i = 0; i < data.length; i++) {
    const [formId, projectId] = data[i];
    if (formId == desiredFormId) {
      return projectId;
    }
  }
  return "";
}

function addRowToIdStore(formId: string, projectId: string) {
  const idStore = SpreadsheetApp.openById(
    "1J_uUVFv9EtI3raTddPRcoKi0Qs1bAEw_E3qSFQU4KD4"
  );
  idStore.appendRow([formId, projectId]);
}
