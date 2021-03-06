import {
  FlattenedData,
  FunctionalityArgs,
  Section,
  StandardQuestionFields,
  FormQuestion,
} from "../../../../../Utils/types";
import functionalityHandler from "./functionalities/handler";

export const createStandardQuestion = (
  form: GoogleAppsScript.Forms.Form,
  question: StandardQuestionFields,
  args: FunctionalityArgs = {}
): FormQuestion => {
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
  formQuestion.setRequired(
    typeof Required === "string" ? JSON.parse(Required.toLowerCase()) : true
  );

  if (Array.isArray(question.Functionalities)) {
    for (const functionality of question.Functionalities)
      functionalityHandler(formQuestion, functionality, args);
  }

  return formQuestion;
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

export const getFirstPageQuestions = (
  sections: Section[],
  projectData: FlattenedData
): StandardQuestionFields[] | null => {
  const onboardedIndex = sections.findIndex(({ name }) => name === "Onboarded");

  const onboardedSection =
    onboardedIndex === -1
      ? null
      : sections.splice(onboardedIndex, 1)[0].questions;

  if (projectData.onboarded !== "Yes") return onboardedSection;

  const usageIndex = sections.findIndex(({ name }) => name === "Usage");

  const usageSection =
    usageIndex === -1 ? null : sections.splice(usageIndex, 1)[0].questions;

  return usageSection;
};
