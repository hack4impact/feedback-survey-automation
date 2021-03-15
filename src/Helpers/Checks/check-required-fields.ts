// Internals
import { ProjectData, CheckedData } from "../../Utils/types";
import { TIME_PERIODS, PROJECT_STATUSES } from "../../Utils/constants";

const checkRequiredFields = (data: ProjectData): CheckedData => {
  const {
    projectName,
    representativeName,
    representativeEmail,
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

  if (typeof representativeName !== "string") {
    throw new Error(
      `This project does not have a string Representative Name (${representativeName})`
    );
  }

  if (typeof representativeEmail !== "string") {
    throw new Error(
      `This project does not have a string Representative Email (${representativeEmail})`
    );
  }

  if (
    !Array.isArray(chapter) ||
    chapter.length !== 1 ||
    typeof chapter[0] !== "string"
  ) {
    throw new Error(
      `${projectName} does not have a string array with length 1 for its Chapter value (${chapter})`
    );
  }

  if (
    !Array.isArray(chapterName) ||
    chapterName.length !== 1 ||
    typeof chapterName[0] !== "string"
  ) {
    throw new Error(
      `${projectName} does not have a string array with length 1 for its Chapter Name value (${chapterName})`
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
