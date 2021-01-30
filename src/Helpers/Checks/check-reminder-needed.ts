// Externals
import moment, { DurationInputArg2 } from "moment";

// Internals
import { normalizeDate } from "../General/index";
import { CheckedData, TimePeriod, TIME_PERIODS } from "../../Utils/types";

const checkReminderNeeded = (data: CheckedData): TimePeriod | null => {
  const deliveryDate = normalizeDate(data.deliveryDate);
  const lastSent = data.lastSent;
  for (const timePeriod of TIME_PERIODS) {
    if (timePeriod === lastSent) break;
    const timeAmount = parseInt(timePeriod.slice(0, 1));

    const milestone = normalizeDate(
      moment().subtract(timeAmount, getTimeUnit(timePeriod))
    );

    if (milestone > deliveryDate) return timePeriod;
  }
  return null;
};

const getTimeUnit = (timePeriod: TimePeriod): DurationInputArg2 => {
  const timeUnit = timePeriod.slice(1, 2);
  switch (timeUnit) {
    case "m": {
      return "months";
    }
    case "y": {
      return "years";
    }
    default: {
      throw new Error(`Unrecognized time unit ${timeUnit}`);
    }
  }
};

export default checkReminderNeeded;
