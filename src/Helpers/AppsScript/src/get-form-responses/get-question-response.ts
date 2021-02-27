// Utils
import {
  FIELDS,
  STANDARD_QUESTIONS,
  MISC_QUESTIONS,
} from "../../../../Utils/constants";
import { StandardQuestionFields } from "../../../../Utils/types";

import { updateProject } from "../helpers/airtable/requests";

// START CONSTANTS
// END CONSTANTS

export const getStandardQuestionResponse = (
  standardQuestion: StandardQuestionFields,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  projectData: Airtable.Record<any>
): string | number | string[] | string[][] | undefined => {
  const { Question, Type } = standardQuestion;

  if (Question === STANDARD_QUESTIONS.startedUsing) {
    updateProject(projectData.id, {
      [FIELDS.onboarded]: itemResponse.getResponse(),
    });
  }

  switch (Type) {
    case "Single Line Text": {
      return itemResponse.getResponse();
    }
    case "Multi Line Text": {
      return itemResponse.getResponse();
    }
    case "Integer": {
      return parseInt(itemResponse.getResponse() as string);
    }
    case "Yes/No": {
      return itemResponse.getResponse();
    }
    case "0-10": {
      return parseInt(itemResponse.getResponse() as string);
    }
    case "Date": {
      return itemResponse.getResponse() || undefined;
    }
    default: {
      return itemResponse.getResponse();
    }
  }
};

export const getMiscQuestionResponse = (
  question: string,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  body: Record<string, unknown>
): void => {
  const misc = MISC_QUESTIONS.find(({ title }) => question === title);

  if (misc !== undefined) {
    const response = itemResponse.getResponse();
    body[misc.field] = response;
  }
};

export const getSuccessQuestionResponse = (
  successQuestion: string,
  itemResponse: GoogleAppsScript.Forms.ItemResponse,
  body: Record<string, unknown>
): void => {
  body[successQuestion.replace("Metric Question", "Rating")] = parseInt(
    itemResponse.getResponse() as string
  );
};
