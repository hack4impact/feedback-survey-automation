import {
  StandardQuestion,
  StandardQuestionFields,
  TimePeriod,
} from "../../../../Utils/types";
import { airtableRequest } from "./helpers";

export const getProjectData = (projectId: string): Airtable.Record<any> => {
  const res = airtableRequest(`Projects/${projectId}`);

  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  }

  throw new Error(
    `An error occurred when fetching data for Project ID ${projectId}`
  );
};

export const updateProject = (
  projectId: string,
  fields: Record<string, any>
): any => {
  const res = airtableRequest(
    `Projects/${projectId}`,
    {
      "Content-Type": "application/json",
    },
    {
      method: "patch",
      payload: JSON.stringify({
        fields,
      }),
    }
  );

  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getBlob().getDataAsString());
    return data;
  }

  throw new Error(
    `An error occurred when updating data for Project ID ${projectId}`
  );
};

export const getStandardQuestions = (
  timePeriod: TimePeriod
): StandardQuestionFields[] => {
  const res = airtableRequest("Standard Questions");

  if (res.getResponseCode() === 200) {
    const records: StandardQuestion[] = JSON.parse(
      res.getBlob().getDataAsString()
    ).records;

    return records
      .filter(
        (question) =>
          !Array.isArray(question.fields["Time Periods"]) ||
          question.fields["Time Periods"].includes(timePeriod)
      )
      .map((record) => record.fields)
      .sort(({ Order: a }, { Order: b }) => (a ?? 0) - (b ?? 0));
  }

  throw new Error("An error occurred when fetching standard questions");
};

export const postProjectSuccessData = (data: Record<string, unknown>): any => {
  Logger.log(data);

  const res = airtableRequest(
    "Project Success Data",
    {
      "Content-Type": "application/json",
    },
    {
      method: "post",
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
