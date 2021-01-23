import { StandardQuestion, StandardQuestionFields } from "../../../Utils/types";

const airtableAuth = `Bearer ${process.env.AIRTABLE_API_KEY}`;

export const getProjectData = (
  projectId: string
): Airtable.Record<Record<string, unknown>> => {
  const targetURL = `https://api.airtable.com/v0/app0TDYnyirqeRk1T/Projects/${projectId}`;
  const res = UrlFetchApp.fetch(targetURL, {
    headers: {
      Authorization: airtableAuth,
    },
  });

  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  }

  throw new Error(
    `An error occurred when fetching data for Project ID ${projectId}`
  );
};

export const getStandardQuestions = (): StandardQuestionFields[] => {
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

export const postProjectSuccessData = (data: Record<string, unknown>): any => {
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
