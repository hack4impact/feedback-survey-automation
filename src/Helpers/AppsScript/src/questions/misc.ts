import { CheckedData } from "../../../../Utils/types";
import { updateProject } from "../airtable/requests";

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
  projectData: CheckedData
): void => {
  MISC_QUESTIONS.forEach(({ title, required }) => {
    const item = form.addTextItem();
    item.setTitle(title);
    item.setRequired(required);
  });
  if (projectData.onboarded !== "Yes") {
    const onboardedQuestion = form.addMultipleChoiceItem();
    const yes = onboardedQuestion.createChoice(
      "Yes",
      FormApp.PageNavigationType.CONTINUE
    );
    const no = onboardedQuestion.createChoice(
      "No",
      FormApp.PageNavigationType.SUBMIT
    );
    onboardedQuestion.setChoices([yes, no]);
    onboardedQuestion.setRequired(true);
    onboardedQuestion.setTitle(ONBOARDED);
    form.addPageBreakItem();
  }
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
