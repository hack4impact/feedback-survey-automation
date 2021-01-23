const airtableAuth = `Bearer ${process.env.AIRTABLE_API_KEY}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getProjectData = (projectId: string) => {
  const targetURL = `https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/${projectId}`;
  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: airtableAuth,
    },
  });

  if (res.getResponseCode() === 200) {
    const data: Airtable.Record<Record<string, unknown>> = JSON.parse(
      res.getBlob().getDataAsString()
    );
    return data;
  }

  throw new Error(
    `An error occurred when fetching data for Project ID ${projectId}`
  );
};

interface StandardQuestion {
  id: string;
  fields: StandardQuestionFields;
  createdTime: string;
}

interface StandardQuestionFields {
  Question: string;
  Type?: "Single Line Text" | "Multi Line Text" | "Integer" | "Yes/No" | "0-10";
  Order?: number;
  Required?: "True" | "False";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStandardQuestions = () => {
  const targetURL =
    "https://api.airtable.com/v0/app0TDYnyirqeRk1T/Standard%20Questions";

  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: airtableAuth,
    },
  });

  if (res.getResponseCode() === 200) {
    const records: StandardQuestion[] = JSON.parse(
      res.getBlob().getDataAsString()
    ).records;

    return records
      .map((record) => record.fields)
      .sort(({ Order: a }, { Order: b }) => (a ?? 0) - (b ?? 0));
  }

  throw new Error("An error occurred when fetching standard questions");
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const postProjectSuccessData = (data: Record<string, unknown>) => {
  Logger.log(data);
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
