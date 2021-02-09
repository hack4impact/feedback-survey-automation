import { FIELDS, STANDARD_QUESTIONS } from "../../../../Utils/constants";
import { Section, StandardQuestionFields } from "../../../../Utils/types";
import { updateProject } from "../airtable/requests";

// START FIELDS
// END FIELDS

const OnboardedDefaultSections: string[] = ["Handoff"];

export const getRequiredValue = (
  req: StandardQuestionFields["Required"]
): boolean => (typeof req === "string" ? JSON.parse(req.toLowerCase()) : true);

export const createStandardQuestion = (
  form: GoogleAppsScript.Forms.Form,
  question: StandardQuestionFields
): void => {
  const { Question, Type, Required } = question;

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
    case "Date": {
      formQuestion = form.addDateItem();
      formQuestion.setIncludesYear(true);
      break;
    }
    default: {
      formQuestion = form.addTextItem();
    }
  }

  formQuestion.setTitle(Question);
  formQuestion.setRequired(getRequiredValue(Required));
};

export const getStandardQuestionResponse = (
  standardQuestion: StandardQuestionFields,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  projectData: Airtable.Record<any>
): string | number | string[] | string[][] | undefined => {
  const { Question, Type } = standardQuestion;

  if (Question === STANDARD_QUESTIONS.startedUsing) {
    updateProject(projectData.id, {
      [FIELDS.onboarded]: itemResponse.getResponse(),
    });
  }

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

    //add this later;
    case "Date": {
      return itemResponse.getResponse() || undefined;
    }
    default: {
      return itemResponse.getResponse();
    }
  }
};

export const getAsSections = (
  standardQuestions: StandardQuestionFields[]
): Section[] => {
  const sections: Section[] = [];
  for (const question of standardQuestions) {
    if (!question.Section || question.Section.trim() === "") {
      question.Section = "";
    }

    const matchingSectionIndex = sections.findIndex(
      (section) => section.name === question.Section
    );
    if (matchingSectionIndex !== -1) {
      const matchingSection = sections[matchingSectionIndex];
      matchingSection.questions.push(question);
    } else {
      sections.push({
        name: question.Section as string,
        questions: [question],
      });
    }
  }
  return sections;
};

export const getOnboardedDefaultSections = (sections: Section[]): Section[] => {
  let onboardedDefaultSections: Section[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (OnboardedDefaultSections.includes(section.name)) {
      onboardedDefaultSections = onboardedDefaultSections.concat(
        sections.splice(i, 1)
      );
      i -= 1;
    }
  }

  return onboardedDefaultSections;
};

export const getOnboardedQuestions = (
  sections: Section[]
): StandardQuestionFields[] => {
  const ONBOARDED = "Onboarded";
  const onboardedIndex = sections.findIndex(({ name }) => name === ONBOARDED);

  if (onboardedIndex === -1) return [];

  return sections.splice(onboardedIndex, 1)[0].questions;
};
