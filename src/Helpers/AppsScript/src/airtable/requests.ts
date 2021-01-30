import {
  StandardQuestion,
  StandardQuestionFields,
} from "../../../../Utils/types";
import { airtableRequest } from "./helpers";

export const getProjectData = (
  projectId: string
): Airtable.Record<Record<string, unknown>> => {
  const res = airtableRequest(`Projects/${projectId}`);

  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  }

  throw new Error(
    `An error occurred when fetching data for Project ID ${projectId}`
  );
};

export const getStandardQuestions = (): StandardQuestionFields[] => {
  const res = airtableRequest("Standard%20Questions");

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

  const res = airtableRequest(
    "Project%20Success%20Data",
    {
      "Content-Type": "application/json",
    },
    {
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
