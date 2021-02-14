export const SubmitIfNo = (
  mcQuestion: GoogleAppsScript.Forms.MultipleChoiceItem
): void => {
  const choices = mcQuestion.getChoices();
  const answerChoiceCalledNoIndex = choices.findIndex(
    (choice) => choice.getValue() === "No"
  );
  if (answerChoiceCalledNoIndex !== -1) {
    const specialAnswerChoice = mcQuestion.createChoice(
      "No",
      FormApp.PageNavigationType.SUBMIT
    );
    choices[answerChoiceCalledNoIndex] = specialAnswerChoice;
    mcQuestion.setChoices(choices);
  } else {
    return;
  }
};
