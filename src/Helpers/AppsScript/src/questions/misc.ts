import { FlattenedData, Section, TimePeriod } from "../../../../Utils/types";
import { updateProject } from "../airtable/requests";
import { createSections } from "../main";
import { createStandardQuestion } from "./standard";

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

const ONBOARDED = "Have you onboarded the project?";

export const createMiscQuestions = (
  form: GoogleAppsScript.Forms.Form,
  projectData: FlattenedData,
  onboardedDefaultSections: Section[]
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
  if (projectData.onboarded !== "Yes") {
    const onboardedQuestion = form.addMultipleChoiceItem();
    onboardedQuestion.setRequired(true);
    onboardedQuestion.setTitle(ONBOARDED);

    const [skipToStandardQs, endForm] = createHiddenSectionsAndReturnSkipItem(
      onboardedDefaultSections,
      form
    );

    let yes: GoogleAppsScript.Forms.Choice;
    let no: GoogleAppsScript.Forms.Choice;
    if (skipToStandardQs !== undefined) {
      yes = onboardedQuestion.createChoice(
        "Yes",
        skipToStandardQs as GoogleAppsScript.Forms.PageBreakItem
      );
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
  body: Record<string, unknown>,
  projectData: Airtable.Record<any>
): void => {
  if (question === ONBOARDED) {
    updateProject(projectData.id, {
      "Onboarded?": itemResponse.getResponse(),
    });
  } else {
    const misc = MISC_QUESTIONS.find(({ title }) => question === title);

    if (misc !== undefined) {
      const response = itemResponse.getResponse();
      body[misc.field] = response;
    }
  }
};

const createHiddenSectionsAndReturnSkipItem = (
  sections: Section[],
  form: GoogleAppsScript.Forms.Form
): [
  GoogleAppsScript.Forms.PageBreakItem | undefined,
  GoogleAppsScript.Forms.PageNavigationType | undefined
] => {
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
    return [skipToStandardQuestions, undefined];
  } else {
    return [undefined, FormApp.PageNavigationType.SUBMIT];
  }
};
