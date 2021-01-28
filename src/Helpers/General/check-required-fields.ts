// Internals
import { ProjectData, CheckedData, TIME_PERIODS } from "../../Utils/types";

const checkRequiredFields = (data: ProjectData): CheckedData => {
  const { projectName, deliveryDate, lastSent } = data;

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
