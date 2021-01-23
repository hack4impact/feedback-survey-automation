import {
  ProjectData,
  StandardQuestionFields,
  TimePeriod,
} from "../../../Utils/types";

const TEMPLATE_FORM_ID = "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs";

export const initializeForm = (
  projectData: ProjectData
): GoogleAppsScript.Forms.Form => {
  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(
      `${projectData.projectName} Feedback Survey`,
      DriveApp.getFolderById("1fWj2K9WAQSxpC9jyOZkRfmOvY186I1Xf")
    )
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(`${projectData.projectName} Feedback Survey`);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);
  form.setDescription(
    `Please fill out this feedback survey for the project ${projectData.projectName} that the Hack4Impact chapter at ${projectData.chapterName} created for your nonprofit ${projectData.nonprofitName}. This information helps us serve our clients better in the future.`
  );

  return form;
};

export const createStandardQuestion = (
  form: GoogleAppsScript.Forms.Form,
  question: StandardQuestionFields,
  timePeriod: TimePeriod
): void => {
  const { Question, Type, Required, "Time Periods": timePeriods } = question;

  if (Array.isArray(timePeriods) && !timePeriods.includes(timePeriod)) return;

  let formQuestion;

  switch (Type) {
    case "Single Line Text": {
      formQuestion = form.addTextItem();
      break;
    }
    case "Multi Line Text": {
      formQuestion = form.addParagraphTextItem();
      break;
    }
    case "Integer": {
      formQuestion = form.addTextItem();
      break;
    }
    case "Yes/No": {
      formQuestion = form.addMultipleChoiceItem();
      const yes = formQuestion.createChoice("Yes");
      const no = formQuestion.createChoice("No");
      formQuestion.setChoices([yes, no]);
      break;
    }
    case "0-10": {
      formQuestion = form.addScaleItem();
      formQuestion.setBounds(0, 10);
      break;
    }
    default: {
      formQuestion = form.addTextItem();
    }
  }

  formQuestion.setTitle(Question);
  formQuestion.setRequired(
    typeof Required === "string" ? JSON.parse(Required.toLowerCase()) : true
  );
};

export const getStandardQuestionResponse = (
  standardQuestion: StandardQuestionFields,
  itemResponse: GoogleAppsScript.Forms.ItemResponse
): string | number | string[] | string[][] => {
  const { Type } = standardQuestion;
  switch (Type) {
    case "Single Line Text": {
      return itemResponse.getResponse();
    }
    case "Multi Line Text": {
      return itemResponse.getResponse();
    }
    case "Integer": {
      return parseInt(itemResponse.getResponse() as string);
    }
    case "Yes/No": {
      return itemResponse.getResponse();
    }
    case "0-10": {
      return parseInt(itemResponse.getResponse() as string);
    }
    default: {
      return itemResponse.getResponse();
    }
  }
};
