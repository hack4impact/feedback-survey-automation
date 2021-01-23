import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
} from "../../../Utils/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const { password, projectData, projectId }: GoogleFormPostData = JSON.parse(
    request.postData.getDataAsString()
  );

  if (typeof projectId !== "string") return createError("No Project ID found");

  if (typeof projectData.projectName !== "string")
    return createError("No Project Name found");

  if (!Array.isArray(projectData.successQuestions))
    return createError("No Success Metric Questions found");

  if (password !== process.env.APPS_SCRIPT_PASSWORD)
    return createError("Wrong APPS_SCRIPT_PASSWORD");

  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(`${projectData.projectName} Feedback Survey`)
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(`${projectData.projectName} Feedback Survey`);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);
  form.setDescription(
    `Please fill out this feedback survey for the project ${projectData.projectName} that the Hack4Impact chapter at ${projectData.chapterName} created for your nonprofit ${projectData.nonprofitName}.`
  );

  //standard beginning questions
  const standardQuestions = getStandardQuestions();
  for (const question of standardQuestions) {
    createStandardQuestion(form, question);
  }

  //form success metric questions
  for (const question of projectData.successQuestions) {
    const questionOnForm = form.addScaleItem();
    questionOnForm.setTitle(question);
    questionOnForm.setBounds(0, 10);
    questionOnForm.setRequired(true);
  }

  // setting form to call airTable update func on submit
  ScriptApp.newTrigger("updateProjectSuccessTable")
    .forForm(form)
    .onFormSubmit()
    .create();

  // coupling form id with projectId
  addRowToIdStore(form.getId(), projectId);

  const formData: GoogleFormData = {
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
  };

  return ContentService.createTextOutput(JSON.stringify(formData));
};

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

const TEMPLATE_FORM_ID = "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateProjectSuccessTable = (
  event: GoogleAppsScript.Events.FormsOnFormSubmit
) => {
  const response = event.response;
  const feedbackDate = response.getTimestamp();
  const form = event.source;
  const formId = form.getId();

  const projectId = getProjectId(formId);
  const projectData = getProjectData(projectId);
  const successQuestionsNum = Object.keys(projectData.fields).filter(
    (field) => field.indexOf("Success Metric Question ") != -1
  );

  const standardQuestions = getStandardQuestions();
  const itemResponses = response.getItemResponses();

  const body: Record<string, unknown> = {
    Project: [projectData.id],
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
  };

  itemResponses.forEach((itemResponse) => {
    const question = itemResponse.getItem().getTitle();

    const standard = standardQuestions.find(
      ({ Question }) => Question === question
    );

    if (standard !== undefined) {
      const { Type, Question } = standard;
      switch (Type) {
        case "Single Line Text": {
          body[Question] = itemResponse.getResponse();
          break;
        }
        case "Multi Line Text": {
          body[Question] = itemResponse.getResponse();
          break;
        }
        case "Integer": {
          body[Question] = parseInt(itemResponse.getResponse() as string);
          break;
        }
        case "Yes/No": {
          body[Question] = itemResponse.getResponse();
          break;
        }
        case "0-10": {
          body[Question] = parseInt(itemResponse.getResponse() as string);
          break;
        }
        default: {
          body[Question] = itemResponse.getResponse();
          break;
        }
      }
    } else {
      const successQuestion = successQuestionsNum.find(
        (qNum) => projectData.fields[qNum] === question
      );

      if (successQuestion !== undefined) {
        body[successQuestion.replace("Metric Question", "Rating")] = parseInt(
          itemResponse.getResponse() as string
        );
      }
    }
  });

  Logger.log(addRecordToAirTable(body));
};

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);
