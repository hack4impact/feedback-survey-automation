import { time } from "console";
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
  onboardedDefaultSections: Section[],
  timePeriod: TimePeriod
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

    const skipToStandardQs = createHiddenSectionsAndReturnSkipItem(
      onboardedDefaultSections,
      form,
      timePeriod
    );

    const yes = onboardedQuestion.createChoice("Yes", skipToStandardQs);
    const no = onboardedQuestion.createChoice(
      "No",
      FormApp.PageNavigationType.CONTINUE
    );
    onboardedQuestion.setChoices([yes, no]);
  }

  createSections(onboardedDefaultSections, form, timePeriod);
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
  form: GoogleAppsScript.Forms.Form,
  timePeriod: TimePeriod
) => {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const currentSection = form.addPageBreakItem();
    if (section.name !== "") {
      const header = form.addSectionHeaderItem();
      header.setTitle(section.name);
    }
    for (const question of section.questions) {
      createStandardQuestion(form, question, timePeriod);
    }
    if (i === sections.length - 1) {
      currentSection.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    }
  }
  const skipToStandardQuestions = form.addPageBreakItem();
  return skipToStandardQuestions;
};
