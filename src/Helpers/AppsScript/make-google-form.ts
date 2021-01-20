import { GoogleFormData } from "../../Utils/types";

const airtableAuth = `Bearer ${process.env.AIRTABLE_API_KEY}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const data = JSON.parse(request.postData.getDataAsString());

  if (
    data.password === process.env.APPS_SCRIPT_PASSWORD &&
    data.projectId &&
    data.questions
  ) {
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
      .onFormSubmit()
      .create();

    // coupling form id with projectId
    addRowToIdStore(form.getId(), data.projectId);

    const formData: GoogleFormData = {
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
    };

    return ContentService.createTextOutput(JSON.stringify(formData));
  } else {
    return ContentService.createTextOutput("Unauthorized");
  }
};

function updateProjectSuccessTable(event: any) {
  const response = event.response;
  const form = event.source;
  const formId = form.getId();

  //deleting trigger to prevent overflow

  let itemResponses = response.getItemResponses();

  itemResponses = itemResponses.map((itemResponse: any) => {
    const question = itemResponse.getItem().getTitle();
    const object = {
      question,
      response: itemResponse.getResponse(),
    };
    return object;
  });

  const projectId = getProjectId(formId);
  const projectData = getProjectData(projectId);

  const fieldData = createAirtableRecordFields(
    itemResponses,
    response,
    projectData
  ); //event source is form
  Logger.log(fieldData);

  Logger.log(addRecordToAirTable(fieldData));
}

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

function getProjectData(projectId: string) {
  const targetURL = `https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/${projectId}`;
  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: airtableAuth,
    },
  });
  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  } else {
    throw new Error("Air table project found.");
  }
}

function createAirtableRecordFields(
  questionResponsePairs: any,
  response: any,
  projectData: Record<string, unknown>
) {
  const projectFields: any = projectData.fields;
  const feedbackDate: any = response.getTimestamp();

  Logger.log(projectFields);

  const body = {
    Id: 0,
    Project: [projectData["id"]],
    "Person Giving Feedback": null,
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getYear()}`,
    "Are you still using the product?": null,
    "If you are not still using the product, when and why did you stop?": null,
    "Have you had to ask for help from others to maintain the project? If so, what tasks needed to be done?": null,
    "Has this solution caused/exacerbated any problems within your org? If so, please describe them.": null,
    "Would you partner with Hack4Impact or a similar organization again in the future? Why or why not?": null,
    "Success Rating 1": null,
    "Success Rating 2": null,
    "Success Rating 3": null,
    "Success Rating 4": null,
    "Success Rating 5": null,
    "Success Rating 6": null,
    "Success Rating 7": null,
    "Success Rating 8": null,
    "Overall, how well is the project working for you at this time?": null,
    "Other Feedback": null,
  };

  //coupling questions that match with reponse body
  for (const pair of questionResponsePairs) {
    const question = pair.question;
    const response = pair.response;

    if (body[question] !== undefined) {
      body[question] = response;
    }
  }

  //Matching success metric fields to correct answers
  for (let questionIndex = 1; questionIndex <= 8; questionIndex++) {
    const successMetricQuestion =
      projectFields[`Success Metric Question ${questionIndex}`];
    for (const pair of questionResponsePairs) {
      if (pair.question == successMetricQuestion) {
        body[`Success Rating ${questionIndex}`] = parseInt(pair.response); // response has to be number
      }
    }
  }

  return body;
}

function addRecordToAirTable(data: any) {
  const res = UrlFetchApp.fetch(
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: airtableAuth,
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
