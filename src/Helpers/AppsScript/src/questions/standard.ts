import { FIELDS, STANDARD_QUESTIONS } from "../../../../Utils/constants";
import {
  FlattenedData,
  Section,
  StandardQuestionFields,
} from "../../../../Utils/types";
import { updateProject } from "../airtable/requests";

// START CONSTANTS
// END CONSTANTS

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
  return standardQuestions.reduce((sections, question) => {
    if (!question.Section || question.Section.trim() === "") {
      question.Section = undefined;
    }

    const matchingSectionIndex = sections.findIndex(
      (section) => section.name === question.Section
    );

    if (matchingSectionIndex === -1) {
      sections.push({
        name: question.Section,
        questions: [question],
      });
    } else {
      const matchingSection = sections[matchingSectionIndex];
      matchingSection.questions.push(question);
    }

    return sections;
  }, [] as Section[]);
};

const OnboardedDefaultSections = ["Handoff"];

export const getOnboardedDefaultSections = (
  sections: Section[]
): Section[] | null => {
  let onboardedDefaultSections: Section[] | null = null;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.name && OnboardedDefaultSections.includes(section.name)) {
      const spliced = sections.splice(i, 1);

      onboardedDefaultSections = onboardedDefaultSections
        ? onboardedDefaultSections.concat(spliced)
        : spliced;

      i -= 1;
    }
  }

  return onboardedDefaultSections;
};

export const getOnboardedQuestions = (
  sections: Section[],
  projectData: FlattenedData
): StandardQuestionFields[] | null => {
  const onboardedIndex = sections.findIndex(({ name }) => name === "Onboarded");

  if (projectData.onboarded !== "Yes")
    return onboardedIndex === -1
      ? null
      : sections.splice(onboardedIndex, 1)[0].questions;

  const usageIndex = sections.findIndex(({ name }) => name === "Usage");

  return usageIndex === -1 ? null : sections.splice(usageIndex, 1)[0].questions;
};
