// Internals
import { ProjectStatus } from "../../Utils/types";
import Logger from "../Logger";

const logFalsey = (projectStatus: ProjectStatus): false => {
  Logger.warn(`Status is '${projectStatus}'. No actions performed.`);
  return false;
};

const checkProjectStatus = (projectStatus?: ProjectStatus): boolean => {
  switch (projectStatus) {
    case "Delivered": {
      return true;
    }
    case "In Progress": {
      return logFalsey(projectStatus);
    }
    case "Unknown": {
      return true;
    }
    case "Abandoned by Dev Team": {
      return logFalsey(projectStatus);
    }
    case "Abandoned by Nonprofit": {
      return logFalsey(projectStatus);
    }
    default: {
      return true;
    }
  }
};

export default checkProjectStatus;
