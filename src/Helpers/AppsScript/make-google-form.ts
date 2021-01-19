export interface GoogleFormData {
  editUrl: string;
  publishedUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeGoogleForm = (request: any) => {
  const data = JSON.parse(request.postData.getDataAsString());

  if (data.password === "hack4impact") {
    const form = FormApp.create(data.projectName);

    //form config
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);

    //form questions
    for (const question of data.questions) {
      const questionOnForm = form.addTextItem();
      questionOnForm.setTitle(question);
    }

    // setting form to call airTable update func on submit
    // ScriptApp.newTrigger("updateProjectSuccessTable").forForm(form).onFormSubmit();

    const formData: GoogleFormData = {
      publishedUrl: form.getPublishedUrl(),
      editUrl: form.getEditUrl(),
    };

    return ContentService.createTextOutput(JSON.stringify(formData));
  } else {
    return ContentService.createTextOutput("Unauthorized");
  }
};
