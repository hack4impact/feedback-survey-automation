import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
} from "../../../../Utils/types";
import { initializeForm } from "./initialize-form";
import { getStandardQuestions } from "../helpers/airtable/requests";
import { storeForm } from "../helpers/form-store";
import {
  getAsSections,
  getOnboardedDefaultSections,
  getFirstPageQuestions,
} from "./questions/standard";
import { createFirstPageQuestions } from "./questions/misc";
import { getSuccessPairSection } from "./questions/metric";
import createSections from "./create-sections";

export const doPost = (
  request: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput => {
  const payload: GoogleFormPostData = JSON.parse(request.postData.contents);

  const { projectData, projectId, timePeriod, dryRun } = payload;

  if (typeof projectId !== "string") return createError("No Project ID found");

  if (typeof projectData.projectName !== "string")
    return createError("No Project Name found");

  if (!Array.isArray(projectData.successQuestions))
    return createError("No Success Metric Questions found");

  if (typeof timePeriod !== "string")
    return createError("No Time Period Found");

  const form = initializeForm(projectData, timePeriod, dryRun);

  // Standard beginning questions
  const standardQuestions = getStandardQuestions(timePeriod);

  const sections = getAsSections(standardQuestions);
  const firstPageQuestions = getFirstPageQuestions(sections, projectData);
  const onboardedDefaultSections = getOnboardedDefaultSections(sections);
  const successQuestionPartnerSection = getSuccessPairSection(sections);

  // Misc questions (name, email)
  createFirstPageQuestions(
    form,
    firstPageQuestions,
    onboardedDefaultSections,
    timePeriod
  );

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

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);
