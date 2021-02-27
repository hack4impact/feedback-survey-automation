const submitIfNo = (
  mcQuestion: GoogleAppsScript.Forms.MultipleChoiceItem
): void => {
  const choices = mcQuestion.getChoices();
  const answerChoiceCalledNoIndex = choices.findIndex(
    (choice) => choice.getValue() === "No"
  );

  if (answerChoiceCalledNoIndex !== -1) {
    const newChoices: GoogleAppsScript.Forms.Choice[] = [];
    choices.splice(answerChoiceCalledNoIndex, 1);

    for (const choice of choices) {
      if (choice.getGotoPage()) {
        newChoices.push(
          mcQuestion.createChoice(choice.getValue(), choice.getGotoPage())
        );
      } else if (choice.getPageNavigationType()) {
        newChoices.push(
          mcQuestion.createChoice(
            choice.getValue(),
            choice.getPageNavigationType()
          )
        );
      } else
        newChoices.push(
          mcQuestion.createChoice(
            choice.getValue(),
            FormApp.PageNavigationType.CONTINUE
          )
        );
    }

    const specialAnswerChoice = mcQuestion.createChoice(
      "No",
      FormApp.PageNavigationType.SUBMIT
    );
    newChoices.push(specialAnswerChoice);

    mcQuestion.setChoices(newChoices);
  }
};

export default submitIfNo;
