// Utils
import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
  Section,
} from "../../../Utils/types";
import { DATA_FIELDS } from "../../../Utils/constants";
import { initializeForm } from "./form-data";

import {
  getStandardQuestions,
  getProjectData,
  postProjectSuccessData,
} from "./airtable/requests";
import { storeForm, getFormStore } from "./form-store";
// Questions
import {
  createStandardQuestion,
  getAsSections,
  getOnboardedDefaultSections,
  getOnboardedQuestions,
  getStandardQuestionResponse,
} from "./questions/standard";
import { getMiscQuestionResponse, createMiscQuestions } from "./questions/misc";
import {
  createSuccessMetricQuestions,
  getSuccessQuestionResponse,
  getSuccessPairSection,
} from "./questions/metric";

// START CONSTANTS
// END CONSTANTS

export const doPost = (
  request: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput => {
  const payload: GoogleFormPostData = JSON.parse(request.postData.contents);

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
  const onboardedQuestions = getOnboardedQuestions(sections, projectData);
  const onboardedDefaultSections = getOnboardedDefaultSections(sections);
  const successQuestionPartnerSection = getSuccessPairSection(sections);

  // Misc questions (name, email)
  createMiscQuestions(form, onboardedQuestions, onboardedDefaultSections);

  // Other Sections
  createSections(
    form,
    sections,
    projectData.successQuestions,
    successQuestionPartnerSection
  );

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
        getSuccessQuestionResponse(successQuestion, itemResponse, body);
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
  form: GoogleAppsScript.Forms.Form,
  sections: Section[] | null,
  successMetricQuestions: string[] | null,
  successPairSection: Section | null
): void => {
  let successMetricCreated = false;
  if (sections) {
    sections.forEach((section, i) => {
      for (const question of section.questions) {
        createStandardQuestion(form, question);
      }

      //creates success metric questions with misc questions if successMetricQuestions was plugged in
      if (
        section.name === "Misc" &&
        !successMetricCreated &&
        successMetricQuestions
      ) {
        createSuccessMetricQuestions(
          form,
          successMetricQuestions,
          successPairSection
        );
        successMetricCreated = true;
      }

      if (i !== sections.length - 1) {
        form.addPageBreakItem();
      }
    });
  }

  if (successMetricQuestions && !successMetricCreated) {
    if (sections && sections.length > 0) form.addPageBreakItem();
    createSuccessMetricQuestions(
      form,
      successMetricQuestions,
      successPairSection
    );
  }
};
