import { Section } from "../../../../Utils/types";
import { createStandardQuestion } from "./standard";

//no page breaks
export const createSuccessMetricQuestions = (
  form: GoogleAppsScript.Forms.Form,
  successQuestions: string[],
  successQuestionPartnerSection: Section | null
): void => {
  if (successQuestions.length) {
    for (const question of successQuestions) {
      const questionOnForm = form.addScaleItem();
      questionOnForm.setTitle(question);
      questionOnForm.setBounds(0, 10);
      questionOnForm.setRequired(true);
    }
  }
  if (successQuestionPartnerSection) {
    for (const question of successQuestionPartnerSection.questions) {
      createStandardQuestion(form, question);
    }
  }
};

export const getSuccessQuestionResponse = (
  successQuestion: string,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  body: Record<string, unknown>
): void => {
  body[successQuestion.replace("Metric Question", "Rating")] = parseInt(
    itemResponse.getResponse() as string
  );
};

export const getSuccessPairSection = (sections: Section[]): Section | null => {
  const successPairSectionIndex = sections.findIndex(
    (section) => section?.name === "Success"
  );
  if (successPairSectionIndex !== -1) {
    return sections.splice(successPairSectionIndex, 1)[0];
  } else {
    return null;
  }
};
