// Internals
import { LogLabel, ProjectStatus } from "../../Utils/types";
import Logger from "../Logger";

const logFalsey = async (
  projectStatus: ProjectStatus,
  logger: Logger
): Promise<false> => {
  await logger.warn(`Status is '${projectStatus}'. No actions performed.`, {
    extra: {
      label: "falseyProjectStatus" as LogLabel,
    },
  });
  return false;
};

const checkProjectStatus = async (
  logger: Logger,
  projectStatus?: ProjectStatus
): Promise<boolean> => {
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
      return await logFalsey(projectStatus, logger);
    }
    case "Abandoned by Nonprofit": {
      return await logFalsey(projectStatus, logger);
    }
    default: {
      return true;
    }
  }
};

export default checkProjectStatus;
