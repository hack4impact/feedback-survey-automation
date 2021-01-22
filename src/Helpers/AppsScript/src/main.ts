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

  if (!Array.isArray(projectData.standardQuestions))
    return createError("No Standard Questions found");

  if (password !== process.env.APPS_SCRIPT_PASSWORD)
    return createError("Wrong APPS_SCRIPT_PASSWORD");

  // copying a template form - cant change color with script
  const newFormId = DriveApp.getFileById(
    "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs"
  )
    .makeCopy("${projectData.projectName} Feedback Survey")
    .getId(); // change to drive app
  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(`${projectData.projectName} Feedback Survey`);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);
  form.setDescription(
    `Please fill out this feedback survey for the project ${projectData.projectName} that the Hack4Impact chapter at ${projectData.chapterName} created for your nonprofit ${projectData.nonprofitName}.`
  );

  //standard beginning questions
  for (const question of projectData.standardQuestions) {
    const questionOnForm = form.addTextItem();
    questionOnForm.setTitle(question);
    questionOnForm.setRequired(true);
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

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);

const updateProjectSuccessTable = (event: any) => {
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
};
