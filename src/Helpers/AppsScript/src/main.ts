import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
  Section,
} from "../../../Utils/types";
import { initializeForm } from "./form-data";
import { getMiscQuestionResponse, createMiscQuestions } from "./questions/misc";
import {
  createStandardQuestion,
  getAsSections,
  getOnboardedDefaultSections,
  getOnboardedQuestions,
  getStandardQuestionResponse,
} from "./questions/standard";
import {
  getStandardQuestions,
  getProjectData,
  postProjectSuccessData,
} from "./airtable/requests";
import { storeForm, getFormStore } from "./form-store";
import { DATA_FIELDS } from "../../../Utils/constants";

// START FIELDS
// END FIELDS

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const payload: GoogleFormPostData = JSON.parse(
    request.postData.getDataAsString()
  );

  const { password, projectData, projectId, timePeriod, dryRun } = payload;

  if (typeof projectId !== "string") return createError("No Project ID found");

  if (typeof projectData.projectName !== "string")
    return createError("No Project Name found");

  if (!Array.isArray(projectData.successQuestions))
    return createError("No Success Metric Questions found");

  if (typeof timePeriod !== "string")
    return createError("No Time Period Found");

  if (password !== process.env.APPS_SCRIPT_PASSWORD)
    return createError("Wrong APPS_SCRIPT_PASSWORD");

  const form = initializeForm(projectData, timePeriod, dryRun);

  // Standard beginning questions
  const standardQuestions = getStandardQuestions(timePeriod);

  const sections = getAsSections(standardQuestions);
  const onboardedQuestions = getOnboardedQuestions(sections);
  const onboardedDefaultSections = getOnboardedDefaultSections(sections);

  // Misc questions (name, email)
  createMiscQuestions(
    form,
    projectData,
    onboardedQuestions,
    onboardedDefaultSections
  );
  createSections(sections, form);

  // Form success metric questions
  form.addPageBreakItem();

  for (const question of projectData.successQuestions) {
    const questionOnForm = form.addScaleItem();
    questionOnForm.setTitle(question);
    questionOnForm.setBounds(0, 10);
    questionOnForm.setRequired(true);
  }

  // Storing form in Spreadsheet to track responses
  !dryRun &&
    storeForm({
      formId: form.getId(),
      projectId,
      timePeriod,
      sentDate: Date.now(),
      responded: "No",
      formEditLink: form.getEditUrl(),
    });

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

export const updateProjectSuccessTable = (
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse
): void => {
  const feedbackDate = response.getTimestamp();
  const formId = form.getId();
  const { projectId, timePeriod } = getFormStore(formId);

  const projectData = getProjectData(projectId);
  const allSuccessQs = Object.keys(projectData.fields).filter(
    (field) => field.indexOf("Success Metric Question ") != -1
  );

  const standardQuestions = getStandardQuestions(timePeriod);
  const itemResponses = response.getItemResponses();

  const body: Record<string, unknown> = {
    [DATA_FIELDS.project]: [projectData.id],
    [DATA_FIELDS.feedbackDate]: `${
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
        itemResponse,
        projectData
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

  body[DATA_FIELDS.responderEmail] = response.getRespondentEmail();
  body[DATA_FIELDS.timePeriod] = timePeriod;

  const result = postProjectSuccessData(body);
  Logger.log(result);
};

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);

export const createSections = (
  sections: Section[],
  form: GoogleAppsScript.Forms.Form
): void => {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    for (const question of section.questions) {
      createStandardQuestion(form, question);
    }
    if (i !== sections.length - 1) {
      form.addPageBreakItem();
    }
  }
};
