export interface GoogleFormData {
  editUrl: string;
  publishedUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeGoogleForm = (request: any) => {
  const data = JSON.parse(request.postData.getDataAsString());

  if (data.password === "hack4impact") {
    const form = FormApp.create(data.projectName);

    //form config
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);

    //form questions
    for (const question of data.questions) {
      const questionOnForm = form.addTextItem();
      questionOnForm.setTitle(question);
    }

    // setting form to call airTable update func on submit
    ScriptApp.newTrigger("updateProjectSuccessTable")
      .forForm(form)
      .onFormSubmit();

    const formData: GoogleFormData = {
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
    };

    return ContentService.createTextOutput(JSON.stringify(formData));
  } else {
    return ContentService.createTextOutput("Unauthorized");
  }
};

function updateProjectSuccessTable(form: any) {
  const response = form.response;

  UrlFetchApp.fetch(
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer keyWt5lrjRSF1z1Ci",
      },
      payload: JSON.stringify({
        records: [
          {
            fields: {},
          },
        ],
      }),
    }
  );
}

function getRowId(desiredFormId: string) {
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

function getProjectData(projectId: string) {
  const AUTH_HEADER = "Bearer keyWt5lrjRSF1z1Ci";
  const targetURL = `https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/${projectId}`;
  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: AUTH_HEADER,
    },
  });
  const data = JSON.parse(res.getBlob().getDataAsString());
  return data;
}

function mapResponseToAirtableRow(
  formData: any,
  projectData: Record<string, unknown>
) {
  //
}

function addRecordToAirTable(data: any) {
  const res = UrlFetchApp.fetch(
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer keyWt5lrjRSF1z1Ci",
      },

      payload: JSON.stringify({
        records: [
          {
            fields: data,
          },
        ],
      }),
    }
  );

  const resData = JSON.parse(res.getBlob().getDataAsString());
  return resData;
}
