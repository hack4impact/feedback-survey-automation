// Externals
import moment, { DurationInputArg2 } from "moment";

// Internals
import { normalizeDate } from "./index";
import { TimePeriod, TIME_PERIODS } from "../../Utils/types";

const checkSurveyNeeded = (
  deliveryDate: number,
  lastSent?: TimePeriod
): TimePeriod | null => {
  for (const timePeriod of TIME_PERIODS) {
    if (timePeriod === lastSent) break;
    const timeAmount = timePeriod.slice(0, 1);

    const milestone = normalizeDate(
      moment().subtract(parseInt(timeAmount), getTimeType(timePeriod))
    );

    if (milestone > deliveryDate) return timePeriod;
  }
  return null;
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
