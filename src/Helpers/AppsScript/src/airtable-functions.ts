const airtableAuth = `Bearer ${process.env.AIRTABLE_API_KEY}`;

const addRecordToAirTable = (data: any) => {
  const res = UrlFetchApp.fetch(
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: airtableAuth,
      },

      payload: JSON.stringify({
        records: [
          {
            fields: data,
          },
        ],
      }),
    }
  );

  const resData = JSON.parse(res.getBlob().getDataAsString());
  return resData;
};

const getProjectData = (projectId: string) => {
  const targetURL = `https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/${projectId}`;
  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: airtableAuth,
    },
  });
  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  } else {
    throw new Error("No Air table project found.");
  }
};

const createAirtableRecordFields = (
  questionResponsePairs: any,
  response: any,
  projectData: Record<string, unknown>
) => {
  const projectFields: any = projectData.fields;
  const feedbackDate: any = response.getTimestamp();

  Logger.log(projectFields);

  const body = {
    Id: 0,
    Project: [projectData["id"]],
    "Person Giving Feedback": null,
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
    "Are you still using the product?": null,
    "If you are not still using the product, when and why did you stop?": null,
    "Have you had to ask for help from others to maintain the project? If so, what tasks needed to be done?": null,
    "Has this solution caused/exacerbated any problems within your org? If so, please describe them.": null,
    "Would you partner with Hack4Impact or a similar organization again in the future? Why or why not?": null,
    "Success Rating 1": null,
    "Success Rating 2": null,
    "Success Rating 3": null,
    "Success Rating 4": null,
    "Success Rating 5": null,
    "Success Rating 6": null,
    "Success Rating 7": null,
    "Success Rating 8": null,
    "Overall, how well is the project working for you at this time?": null,
    "Other Feedback": null,
  };

  //coupling questions that match with reponse body
  for (const pair of questionResponsePairs) {
    const question = pair.question;
    const response = pair.response;

    if (body[question] !== undefined) {
      if (
        question ===
        "Overall, how well is the project working for you at this time?"
      ) {
        body[question] = parseInt(response);
        continue;
      }
      body[question] = response;
    } else if (pair.question === "Any other feedback?") {
      body["Other Feedback"] = response;
    }
  }

  //Matching success metric fields to correct answers
  for (let questionIndex = 1; questionIndex <= 8; questionIndex++) {
    const successMetricQuestion =
      projectFields[`Success Metric Question ${questionIndex}`];
    for (const pair of questionResponsePairs) {
      if (pair.question == successMetricQuestion) {
        body[`Success Rating ${questionIndex}`] = parseInt(pair.response); // response has to be number
      }
    }
  }

  return body;
};
