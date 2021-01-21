import { GoogleFormData } from "../../../Utils/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const data = JSON.parse(request.postData.getDataAsString());

  if (
    data.password === process.env.APPS_SCRIPT_PASSWORD &&
    data.projectId &&
    data.questions
  ) {
    const form = FormApp.create(data.projectName);

    //form config
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);

    //standard beginning questions
    let currentQuestion: any = form.addMultipleChoiceItem();
    currentQuestion.setTitle("Are you still using the product?");
    currentQuestion.setChoices([
      currentQuestion.createChoice("Yes"),
      currentQuestion.createChoice("No"),
    ]);
    currentQuestion.setRequired(true);

    currentQuestion = form.addTextItem();
    currentQuestion.setTitle(
      "If you are not still using the product, when and why did you stop?"
    );

    //form success metric questions
    for (const question of data.questions) {
      const questionOnForm = form.addScaleItem();
      questionOnForm.setTitle(question);
      questionOnForm.setBounds(0, 10);
    }

    //standard ending questions
    currentQuestion = form.addScaleItem();
    currentQuestion.setTitle(
      "Overall, how well is the project working for you at this time?"
    );
    currentQuestion.setBounds(0, 10);
    currentQuestion.setRequired(true);

    currentQuestion = form.addTextItem();
    currentQuestion.setTitle(
      "Have you had to ask for help from others to maintain the project? If so, what tasks needed to be done?"
    );

    currentQuestion = form.addTextItem();
    currentQuestion.setTitle(
      "Has this solution caused/exacerbated any problems within your org? If so, please describe them."
    );

    currentQuestion = form.addTextItem();
    currentQuestion.setTitle(
      "Would you partner with Hack4Impact or a similar organization again in the future? Why or why not?"
    );

    currentQuestion = form.addTextItem();
    currentQuestion.setTitle("Any other feedback?");

    // setting form to call airTable update func on submit
    ScriptApp.newTrigger("updateProjectSuccessTable")
      .forForm(form)
      .onFormSubmit()
      .create();

    // coupling form id with projectId
    addRowToIdStore(form.getId(), data.projectId);

    const formData: GoogleFormData = {
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
    };

    return ContentService.createTextOutput(JSON.stringify(formData));
  } else {
    return ContentService.createTextOutput("Unauthorized");
  }
};

function updateProjectSuccessTable(event: any) {
  const response = event.response;
  const form = event.source;
  const formId = form.getId();

  //deleting trigger to prevent overflow

  let itemResponses = response.getItemResponses();

  itemResponses = itemResponses.map((itemResponse: any) => {
    const question = itemResponse.getItem().getTitle();
    const object = {
      question,
      response: itemResponse.getResponse(),
    };
    return object;
  });

  const projectId = getProjectId(formId);
  const projectData = getProjectData(projectId);

  const fieldData = createAirtableRecordFields(
    itemResponses,
    response,
    projectData
  ); //event source is form
  Logger.log(fieldData);

  Logger.log(addRecordToAirTable(fieldData));
}