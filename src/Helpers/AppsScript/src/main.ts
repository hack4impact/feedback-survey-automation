import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
} from "../../../Utils/types";
import { initializeForm } from "./form-data";
import { getMiscQuestionResponse, createMiscQuestions } from "./questions/misc";
import {
  createStandardQuestion,
  getStandardQuestionResponse,
} from "./questions/standard";
import {
  getStandardQuestions,
  getProjectData,
  postProjectSuccessData,
} from "./airtable/requests";
import { storeForm, getFormStore } from "./form-store";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const {
    password,
    projectData,
    projectId,
    timePeriod,
  }: GoogleFormPostData = JSON.parse(request.postData.getDataAsString());

  if (typeof projectId !== "string") return createError("No Project ID found");

  if (typeof projectData.projectName !== "string")
    return createError("No Project Name found");

  if (!Array.isArray(projectData.successQuestions))
    return createError("No Success Metric Questions found");

  if (typeof timePeriod !== "string")
    return createError("No Time Period Found");

  if (password !== process.env.APPS_SCRIPT_PASSWORD)
    return createError("Wrong APPS_SCRIPT_PASSWORD");

  const form = initializeForm(projectData, timePeriod);

  createMiscQuestions(form);

  //standard beginning questions
  const standardQuestions = getStandardQuestions();
  for (const question of standardQuestions) {
    createStandardQuestion(form, question, timePeriod);
  }

  //form success metric questions
  for (const question of projectData.successQuestions) {
    const questionOnForm = form.addScaleItem();
    questionOnForm.setTitle(question);
    questionOnForm.setBounds(0, 10);
    questionOnForm.setRequired(true);
  }

  // setting form to call airTable update func on submit
  // ScriptApp.newTrigger("updateProjectSuccessTable")
  //   .forForm(form)
  //   .onFormSubmit()
  //   .create();

  // coupling form id with projectId
  storeForm([
    form.getId(),
    projectId,
    timePeriod,
    Date.now().toString(),
    "No",
    form.getEditUrl(),
  ]);

  const formData: GoogleFormData = {
    id: form.getId(),
    title: form.getTitle(),
    description: form.getDescription(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    summaryUrl: form.getSummaryUrl(),
  };

  return ContentService.createTextOutput(JSON.stringify(formData));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateProjectSuccessTable = (
  //  event: GoogleAppsScript.Events.FormsOnFormSubmit
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse
): void => {
  const feedbackDate = response.getTimestamp();
  const formId = form.getId();

  const [projectId, timePeriod] = getFormStore(formId);
  const projectData = getProjectData(projectId);
  const allSuccessQs = Object.keys(projectData.fields).filter(
    (field) => field.indexOf("Success Metric Question ") != -1
  );

  const standardQuestions = getStandardQuestions();
  const itemResponses = response.getItemResponses();

  const body: Record<string, unknown> = {
    Project: [projectData.id],
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
  };

  itemResponses.forEach((itemResponse) => {
    const question = itemResponse.getItem().getTitle();

    const standard = standardQuestions.find(
      ({ Question }) => Question === question
    );

    if (standard !== undefined) {
      body[standard.Question] = getStandardQuestionResponse(
        standard,
        itemResponse
      );
    } else {
      const successQuestion = allSuccessQs.find(
        (qNum) => projectData.fields[qNum] === question
      );

      if (successQuestion !== undefined) {
        body[successQuestion.replace("Metric Question", "Rating")] = parseInt(
          itemResponse.getResponse() as string
        );
      } else {
        getMiscQuestionResponse(question, itemResponse, body);
      }
    }
  });

  body["Responder Email"] = response.getRespondentEmail();
  body["Response Time Period"] = timePeriod;

  const result = postProjectSuccessData(body);
  Logger.log(result);
};

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);
