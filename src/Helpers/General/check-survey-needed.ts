// Externals
import moment, { DurationInputArg2, Moment } from "moment";

// Internals
import { normalizeDate } from "./index";
import { TimePeriod, TIME_PERIODS } from "../../Utils/types";

const checkSurveyNeeded = (
  releaseDate: number,
  lastSent?: TimePeriod
): TimePeriod | false => {
  const milestones: Moment[] = TIME_PERIODS.map((timePeriod) => {
    const timeAmount = timePeriod.slice(0, 1);

    return moment().subtract(parseInt(timeAmount), getTimeType(timePeriod));
  });

  const index =
    typeof lastSent === "string" ? TIME_PERIODS.indexOf(lastSent) + 1 : 0;

  if (index < TIME_PERIODS.length) {
    const milestone = milestones[index];
    return normalizeDate(milestone) > releaseDate ? TIME_PERIODS[index] : false;
  }
  return false;
};

const getTimeType = (timePeriod: TimePeriod): DurationInputArg2 => {
  const timeType = timePeriod.slice(1, 2);
  switch (timeType) {
    case "m": {
      return "months";
    }
    case "y": {
      return "years";
    }
    default: {
      throw new Error(`Unrecognized time type ${timeType}`);
    }
  }
};

export default checkSurveyNeeded;
