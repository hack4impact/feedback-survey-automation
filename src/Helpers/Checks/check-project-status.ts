// Internals
import { ProjectStatus } from "../../Utils/types";

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
      return false;
    }
    case "Abandoned by Nonprofit": {
      return false;
    }
    default: {
      return true;
    }
  }
};

export default checkProjectStatus;
