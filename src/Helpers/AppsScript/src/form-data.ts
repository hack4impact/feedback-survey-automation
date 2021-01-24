import {
  ProjectData,
  StandardQuestionFields,
  TimePeriod,
} from "../../../Utils/types";

const TEMPLATE_FORM_ID = "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs";

const _READABLE_TIME_PERIODS: Record<TimePeriod, string> = {
  "1m": "1 month",
  "6m": "6 months",
  "1y": "1 year",
  "3y": "3 years",
  "5y": "5 years",
};

export const READABLE_TIME_PERIODS = { ..._READABLE_TIME_PERIODS };

export const initializeForm = (
  projectData: ProjectData,
  timePeriod: TimePeriod
): GoogleAppsScript.Forms.Form => {
  const title = `${projectData.projectName} Feedback Survey - ${_READABLE_TIME_PERIODS[timePeriod]}`;
  const editors = [projectData.chapterEmail, projectData.registrerEmail].filter(
    (editor): editor is string => typeof editor === "string"
  );
  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(
      title,
      DriveApp.getFolderById("1fWj2K9WAQSxpC9jyOZkRfmOvY186I1Xf")
    )
    .addEditors(editors)
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(title);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
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

interface MiscQuestion {
  title: string;
  field: string;
  required: boolean;
}

const MISC_QUESTIONS: MiscQuestion[] = [
  {
    title: "Your Name",
    required: true,
    field: "Responder Name",
  },
];

export const createMiscQuestions = (
  form: GoogleAppsScript.Forms.Form
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
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

export const getMiscQuestionResponse = (
  question: string,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  body: Record<string, unknown>
): void => {
  const misc = MISC_QUESTIONS.find(({ title }) => question === title);

  if (misc !== undefined) {
    const response = itemResponse.getResponse();
    body[misc.field] = response;
  }
};
