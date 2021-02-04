// Internals
import {
  ProjectData,
  TIME_PERIODS,
  PROJECT_STATUSES,
  CheckedData,
} from "../../Utils/types";

const checkRequiredFields = (data: ProjectData): CheckedData => {
  const {
    projectName,
    chapter,
    chapterName,
    nonprofitName,
    deliveryDate,
    projectSuccessData,
    projectStatus,
    lastSent,
  } = data;

  if (typeof projectName !== "string") {
    throw new Error(
      `This project does not have a string name (${projectName})`
    );
  }

  if (
    !Array.isArray(chapter) &&
    chapter.length !== 1 &&
    typeof chapter[0] !== "string"
  ) {
    throw new Error(
      `${projectName} does not have a string array with length 1 chapter (${chapter})`
    );
  }

  if (
    !Array.isArray(chapterName) &&
    chapterName.length !== 1 &&
    typeof chapterName[0] !== "string"
  ) {
    throw new Error(
      `${projectName} does not have a string array with length 1 chapter name (${chapterName})`
    );
  }

  if (typeof nonprofitName !== "string") {
    throw new Error(
      `${projectName} does not have a string nonprofit name (${nonprofitName})`
    );
  }

  if (typeof deliveryDate !== "string") {
    throw new Error(
      `${projectName} does not have a string delivery date (${deliveryDate})`
    );
  }

  if (projectSuccessData !== undefined && !Array.isArray(projectSuccessData)) {
    throw new Error(
      `${projectName} does not have an array of Project Success Data (${projectSuccessData})`
    );
  }

  if (projectStatus !== undefined) {
    if (typeof projectStatus !== "string") {
      throw new Error(
        `${projectName} does not have a string Project Status value (${projectStatus})`
      );
    }

    // @ts-expect-error Trying to check if projectStatus is a valid project status
    if (!PROJECT_STATUSES.includes(projectStatus)) {
      throw new Error(
        `${projectName} does not have a valid Project Status value (${projectStatus})`
      );
    }
  }

  if (lastSent !== undefined) {
    if (typeof lastSent !== "string") {
      throw new Error(
        `${projectName} does not have a string Last Sent value (${lastSent})`
      );
    }

    // @ts-expect-error Trying to check if lastSent is a valid time period
    if (!TIME_PERIODS.includes(lastSent)) {
      throw new Error(
        `${projectName} does not have a valid time period for its Last Sent value (${lastSent})`
      );
    }
  }

  return data as CheckedData;
};

export default checkRequiredFields;