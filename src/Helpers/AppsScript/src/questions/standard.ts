import {
  Section,
  StandardQuestionFields,
  TimePeriod,
} from "../../../../Utils/types";

export const createStandardQuestion = (
  form: GoogleAppsScript.Forms.Form,
  question: StandardQuestionFields,
  timePeriod: TimePeriod
): void => {
  const { Question, Type, Required, "Time Periods": timePeriods } = question;

  if (Array.isArray(timePeriods) && !timePeriods.includes(timePeriod)) return;

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
};

export const getStandardQuestionResponse = (
  standardQuestion: StandardQuestionFields,
  itemResponse: GoogleAppsScript.Forms.ItemResponse
): string | number | string[] | string[][] => {
  const { Type } = standardQuestion;
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
      return "";
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
