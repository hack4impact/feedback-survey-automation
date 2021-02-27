import {
  FormQuestion,
  Section,
  StandardQuestionFields,
  TimePeriod,
} from "../../../../../Utils/types";
import { MISC_QUESTIONS } from "../../../../../Utils/constants";
import functionalityHandler from "./functionalities/handler";
import createSections from "../create-sections";
import { createStandardQuestion } from "./standard";

// START CONSTANTS
// END CONSTANTS

export const createFirstPageQuestions = (
  form: GoogleAppsScript.Forms.Form,
  firstPageQuestions: StandardQuestionFields[] | null,
  onboardedDefaultSections: Section[] | null | undefined,
  timeperiod: TimePeriod
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

      if (
        question.Functionalities?.includes("OnboardedLogic") &&
        ((question.Functionalities?.includes("OnboardedLogicOn1m") &&
          timeperiod === "1m") ||
          !question.Functionalities?.includes("OnboardedLogicOn1m"))
      ) {
        onboardedQuestion = formQuestion;
      }
    }

    if (onboardedQuestion) {
      functionalityHandler(onboardedQuestion, "OnboardedLogic", {
        form,
        onboardedDefaultSections: onboardedDefaultSections as Section[],
        enableFunctionality: true,
      });
    } else {
      if (
        Array.isArray(onboardedDefaultSections) &&
        onboardedDefaultSections.length > 0
      ) {
        form.addPageBreakItem();
        createSections(form, onboardedDefaultSections as Section[], null, null);
      }
    }
  }
  form.addPageBreakItem();
};
