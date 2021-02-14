import { FunctionalityArgs, Section } from "../../../../../Utils/types";
import { createSections } from "../../main";
import { createStandardQuestion } from "../standard";

export const OnboardedLogic = (
  question: GoogleAppsScript.Forms.MultipleChoiceItem,
  args: FunctionalityArgs
): void => {
  if (
    !args.onboardedDefaultSections ||
    !args.form ||
    args.enableFunctionality !== true
  )
    return;

  const skipToStandardQs = createHiddenSections(
    args.onboardedDefaultSections,
    args.form
  );

  let yes: GoogleAppsScript.Forms.Choice;
  let no: GoogleAppsScript.Forms.Choice;
  if (skipToStandardQs !== null) {
    yes = question.createChoice("Yes", skipToStandardQs);
    no = question.createChoice("No", FormApp.PageNavigationType.CONTINUE);
  } else {
    yes = question.createChoice("Yes", FormApp.PageNavigationType.CONTINUE);
    no = question.createChoice("No", FormApp.PageNavigationType.SUBMIT);
  }
  question.setChoices([yes, no]);

  createSections(args.form, args.onboardedDefaultSections, null, null);
};

const createHiddenSections = (
  sections: Section[] | null,
  form: GoogleAppsScript.Forms.Form
): GoogleAppsScript.Forms.PageBreakItem | null => {
  if (!sections) return null;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    form.addPageBreakItem();

    for (const question of section.questions) {
      createStandardQuestion(form, question);
    }
  }

  const finalSection = form.addPageBreakItem();
  finalSection.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  const skipToStandardQuestions = form.addPageBreakItem();
  return skipToStandardQuestions;
};
