// Internals
import { ProjectStatus } from "../../Utils/types";
import Logger from "../Logger";

const logFalsey = (projectStatus: ProjectStatus) => {
  Logger.warning(`Status is '${projectStatus}'. No actions performed.`);
};

const checkProjectStatus = (projectStatus?: ProjectStatus): boolean => {
  switch (projectStatus) {
    case "Delivered": {
      return true;
    }
    case "In Progress": {
      return true;
    }
    case "Unknown": {
      return true;
    }
    case "Abandoned by Dev Team": {
      logFalsey(projectStatus);
      return false;
    }
    case "Abandoned by Nonprofit": {
      logFalsey(projectStatus);
      return false;
    }
    default: {
      return true;
    }
  }
};

export default checkProjectStatus;
