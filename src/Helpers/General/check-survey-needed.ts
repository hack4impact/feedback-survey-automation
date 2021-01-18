// Externals
import moment, { Moment } from "moment";

// Internals
import { normalizeDate } from "./index";
import { TimePeriod } from "../../Utils/types";

const checkSurveyNeeded = (
  releaseDate: number,
  projectData?: Record<string, string>
): TimePeriod | null => {
  type Milestone = [Moment, TimePeriod];

  const milestones: Milestone[] = [
    [moment().subtract(1, "month"), "1m"],
    [moment().subtract(6, "months"), "6m"],
    [moment().subtract(1, "year"), "1y"],
    [moment().subtract(3, "years"), "3y"],
    [moment().subtract(5, "years"), "5y"],
  ];

  const index = milestones.findIndex(([date, period]) => {
    if (!projectData?.[period] && normalizeDate(date) > releaseDate)
      return true;
    return false;
  });

  return index === -1 ? null : milestones[index][1];
};

export default checkSurveyNeeded;
