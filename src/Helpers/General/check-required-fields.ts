// Internals
import {
  ProjectData,
  CheckedData,
  TIME_PERIODS,
  PROJECT_STATUSES,
} from "../../Utils/types";

const checkRequiredFields = (data: ProjectData): CheckedData => {
  const {
    projectName,
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
        `${projectName} has a non-string Project Status value (${projectStatus})`
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
        `${projectName} has a non-string Last Sent value (${lastSent})`
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
