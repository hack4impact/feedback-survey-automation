import { Section } from "../../../../Utils/types";
import { createStandardQuestion } from "./questions/standard";
import { createSuccessMetricQuestions } from "./questions/metric";

const createSections = (
  form: GoogleAppsScript.Forms.Form,
  sections: Section[] | null,
  successMetricQuestions: string[] | null,
  successPairSection: Section | null
): void => {
  let successMetricCreated = false;
  if (sections) {
    sections.forEach((section, i) => {
      for (const question of section.questions) {
        createStandardQuestion(form, question);
      }

      //creates success metric questions with misc questions if successMetricQuestions was plugged in
      if (
        section.name === "Misc" &&
        !successMetricCreated &&
        successMetricQuestions
      ) {
        createSuccessMetricQuestions(
          form,
          successMetricQuestions,
          successPairSection
        );
        successMetricCreated = true;
      }

      if (i !== sections.length - 1) {
        form.addPageBreakItem();
      }
    });
  }

  if (successMetricQuestions && !successMetricCreated) {
    if (sections && sections.length > 0) form.addPageBreakItem();
    createSuccessMetricQuestions(
      form,
      successMetricQuestions,
      successPairSection
    );
  }
};

export default createSections;
