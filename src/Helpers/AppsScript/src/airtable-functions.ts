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
  questionResponsePairs: Array<any>,
  response: any,
  projectData: Record<string, unknown>
) => {
  const projectFields: any = projectData.fields;
  const feedbackDate: any = response.getTimestamp();

  Logger.log(projectFields);

  let body: Record<string, unknown> = {
    Id: 0,
    Project: [projectData["id"]],
    "Person Giving Feedback": null,
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
    "Success Rating 1": null,
    "Success Rating 2": null,
    "Success Rating 3": null,
    "Success Rating 4": null,
    "Success Rating 5": null,
    "Success Rating 6": null,
    "Success Rating 7": null,
    "Success Rating 8": null,
    "Overall, how well is the project working for you at this time?": questionResponsePairs.find(
      checkOverall
    )
      ? parseInt(questionResponsePairs.find(checkOverall).response)
      : null,
    "Other Feedback": null,
  };

  function checkOverall(pair: any) {
    if (
      pair.question ===
      "Overall, how well is the project working for you at this time?"
    ) {
      return true;
    }
    return false;
  }

  // copying responsePairs to create a version to be appended to body
  // getting rid of non-standard and non-success metric  questions
  const questionResponsePairsCopy = [...questionResponsePairs];
  for (let i = 0; i < questionResponsePairsCopy.length; i++) {
    if (
      questionResponsePairsCopy[i].question === "Email address" ||
      questionResponsePairsCopy[i].question ===
        "Overall, how well is the project working for you at this time?"
    ) {
      questionResponsePairsCopy.splice(i, 1);
    }
  }

  //Matching success metric fields to correct answers
  for (let questionIndex = 1; questionIndex <= 8; questionIndex++) {
    const successMetricQuestion =
      projectFields[`Success Metric Question ${questionIndex}`];
    for (let i = 0; i < questionResponsePairsCopy.length; i++) {
      const pair = questionResponsePairsCopy[i];
      if (pair.question == successMetricQuestion) {
        body[`Success Rating ${questionIndex}`] = parseInt(pair.response); // response has to be number
        questionResponsePairsCopy.splice(i, 1);
      }
    }
  }

  const questionResponsePairsObject = {};
  questionResponsePairsCopy.forEach((pair) => {
    questionResponsePairsObject[pair.question] = pair.response;
  });

  body = { ...body, ...questionResponsePairsObject };

  return body;
};

const getAirtableFields = () => {
  const res = UrlFetchApp.fetch(
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Project%20Success%20Data",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: airtableAuth,
      },
    }
  );
};
