// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createStandardQuestion = (
  form: GoogleAppsScript.Forms.Form,
  question: StandardQuestionFields
) => {
  const { Question, Type } = question;
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
    default: {
      formQuestion = form.addTextItem();
    }
  }

  formQuestion.setTitle(Question);
  formQuestion.setRequired(true);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStandardQuestionResponse = (
  standardQuestion: StandardQuestionFields,
  itemResponse: GoogleAppsScript.Forms.ItemResponse
) => {
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
    default: {
      return itemResponse.getResponse();
    }
  }
};
