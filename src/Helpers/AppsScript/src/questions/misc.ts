import { DATA_FIELDS } from "../../../../Utils/constants";
import { Section, StandardQuestionFields } from "../../../../Utils/types";
import { createSections } from "../main";
import { createStandardQuestion, getRequiredValue } from "./standard";

// START FIELDS
// END FIELDS

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

export const createMiscQuestions = (
  form: GoogleAppsScript.Forms.Form,
  onboardedQuestions: StandardQuestionFields[] | null,
  onboardedDefaultSections: Section[] | null
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
  if (onboardedQuestions) {
    const [isOnboarded] = onboardedQuestions.splice(0, 1);

    const onboardedQuestion = form.addMultipleChoiceItem();
    onboardedQuestion.setRequired(getRequiredValue(isOnboarded.Required));
    onboardedQuestion.setTitle(isOnboarded.Question);

    onboardedQuestions.forEach((q) => createStandardQuestion(form, q));

    const skipToStandardQs = createHiddenSections(
      onboardedDefaultSections,
      form
    );

    let yes: GoogleAppsScript.Forms.Choice;
    let no: GoogleAppsScript.Forms.Choice;
    if (skipToStandardQs !== null) {
      yes = onboardedQuestion.createChoice("Yes", skipToStandardQs);
      no = onboardedQuestion.createChoice(
        "No",
        FormApp.PageNavigationType.CONTINUE
      );
    } else {
      yes = onboardedQuestion.createChoice(
        "Yes",
        FormApp.PageNavigationType.CONTINUE
      );
      no = onboardedQuestion.createChoice(
        "No",
        FormApp.PageNavigationType.SUBMIT
      );
    }
    onboardedQuestion.setChoices([yes, no]);

    createSections(form, onboardedDefaultSections);
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

const createHiddenSections = (
  sections: Section[] | null,
  form: GoogleAppsScript.Forms.Form
): GoogleAppsScript.Forms.PageBreakItem | null => {
  if (!sections) return null;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    form.addPageBreakItem();

    for (const question of section.questions) {
      createStandardQuestion(form, question);
    }
  }

  const finalSection = form.addPageBreakItem();
  finalSection.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  const skipToStandardQuestions = form.addPageBreakItem();
  return skipToStandardQuestions;
};
