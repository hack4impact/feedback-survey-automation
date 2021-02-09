export const createSuccessMetricQuestions = (
  form: GoogleAppsScript.Forms.Form,
  successQuestions: string[]
): void => {
  if (successQuestions.length) {
    form.addPageBreakItem();

    for (const question of successQuestions) {
      const questionOnForm = form.addScaleItem();
      questionOnForm.setTitle(question);
      questionOnForm.setBounds(0, 10);
      questionOnForm.setRequired(true);
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
