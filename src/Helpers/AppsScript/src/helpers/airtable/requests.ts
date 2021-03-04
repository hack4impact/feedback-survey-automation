import { airtableRequest } from "./helpers";
import { DATA_FIELDS } from "../../../../../Utils/constants";
import {
  StandardQuestion,
  StandardQuestionFields,
  TimePeriod,
} from "../../../../../Utils/types";
import { getFormStore } from "../form-store";
import {
  getStandardQuestionResponse,
  getMiscQuestionResponse,
  getSuccessQuestionResponse,
} from "../../get-form-responses/get-question-response";

// START CONSTANTS
// END CONSTANTS

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

export const updateProjectSuccessTable = (
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse
): void => {
  const feedbackDate = response.getTimestamp();
  const formId = form.getId();
  const { projectId, timePeriod } = getFormStore(formId);

  const projectData = getProjectData(projectId);
  const allSuccessQs = Object.keys(projectData.fields).filter(
    (field) => field.indexOf("Success Metric Question ") != -1
  );

  const standardQuestions = getStandardQuestions(timePeriod);
  const itemResponses = response.getItemResponses();

  const body: Record<string, unknown> = {
    [DATA_FIELDS.project]: [projectData.id],
    [DATA_FIELDS.feedbackDate]: `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
  };

  itemResponses.forEach((itemResponse) => {
    const question = itemResponse.getItem().getTitle();

    const standard = standardQuestions.find(
      ({ Question }) => Question === question
    );

    if (standard !== undefined) {
      body[standard.Question] = getStandardQuestionResponse(
        standard,
        itemResponse,
        projectData
      );
    } else {
      const successQuestion = allSuccessQs.find(
        (qNum) => projectData.fields[qNum] === question
      );

      if (successQuestion !== undefined) {
        getSuccessQuestionResponse(successQuestion, itemResponse, body);
      } else {
        getMiscQuestionResponse(question, itemResponse, body);
      }
    }
  });

  body[DATA_FIELDS.responderEmail] = response.getRespondentEmail();
  body[DATA_FIELDS.timePeriod] = timePeriod;

  postProjectSuccessData(body);
};
