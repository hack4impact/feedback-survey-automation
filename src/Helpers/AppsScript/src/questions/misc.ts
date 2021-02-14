import { DATA_FIELDS } from "../../../../Utils/constants";
import {
  FormQuestion,
  Section,
  StandardQuestionFields,
} from "../../../../Utils/types";
import { HandleFunctionality } from "./functionalities/Handler";
import { createStandardQuestion } from "./standard";

// START CONSTANTS
// END CONSTANTS

interface MiscQuestion {
  title: string;
  field: string;
  required: boolean;
}

const MISC_QUESTIONS: MiscQuestion[] = [
  {
    title: "Your Name",
    required: true,
    field: DATA_FIELDS.responderName,
  },
];

export const createFirstPageQuestions = (
  form: GoogleAppsScript.Forms.Form,
  firstPageQuestions: StandardQuestionFields[] | null,
  onboardedDefaultSections: Section[] | null | undefined
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
  if (firstPageQuestions) {
    let onboardedQuestion: FormQuestion | null = null;

    for (const question of firstPageQuestions) {
      const formQuestion = createStandardQuestion(form, question);

      if (question.Functionalities?.includes("OnboardedLogic")) {
        onboardedQuestion = formQuestion;
      }
    }

    if (onboardedQuestion)
      HandleFunctionality(onboardedQuestion, "OnboardedLogic", {
        form,
        onboardedDefaultSections: onboardedDefaultSections as Section[],
        enableFunctionality: true,
      });
  }
  form.addPageBreakItem();
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
