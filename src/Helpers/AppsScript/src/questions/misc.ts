import {
  FlattenedData,
  Section,
  StandardQuestionFields,
} from "../../../../Utils/types";
import { createSections } from "../main";
import { createStandardQuestion, getRequiredValue } from "./standard";

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
  form: GoogleAppsScript.Forms.Form,
  projectData: FlattenedData,
  onboardedQuestions: StandardQuestionFields[],
  onboardedDefaultSections: Section[]
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
  if (projectData.onboarded !== "Yes") {
    const [isOnboarded] = onboardedQuestions.splice(0, 1);

    const onboardedQuestion = form.addMultipleChoiceItem();
    onboardedQuestion.setRequired(getRequiredValue(isOnboarded.Required));
    onboardedQuestion.setTitle(isOnboarded.Question);

    onboardedQuestions.forEach((q) => createStandardQuestion(form, q));

    const skipToStandardQs = createHiddenSectionsAndReturnSkipItem(
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

    createSections(onboardedDefaultSections, form);
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

const createHiddenSectionsAndReturnSkipItem = (
  sections: Section[],
  form: GoogleAppsScript.Forms.Form
): GoogleAppsScript.Forms.PageBreakItem | null => {
  if (sections.length !== 0) {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      form.addPageBreakItem();
      if (section.name !== "") {
        const header = form.addSectionHeaderItem();
        header.setTitle(section.name);
      }
      for (const question of section.questions) {
        createStandardQuestion(form, question);
      }
    }

    const finalSection = form.addPageBreakItem();
    finalSection.setGoToPage(FormApp.PageNavigationType.SUBMIT);

    const skipToStandardQuestions = form.addPageBreakItem();
    return skipToStandardQuestions;
  } else {
    return null;
  }
};
