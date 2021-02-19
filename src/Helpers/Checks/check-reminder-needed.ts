// Externals
import moment, { DurationInputArg2 } from "moment";

// Internals
import { normalizeDate } from "../General/index";
import Logger from "../Logger";
import { FlattenedData, TimePeriod } from "../../Utils/types";
import {
  TIME_PERIODS,
  READABLE_TIME_PERIODS,
  timePeriodExpiryInWeeks,
} from "../../Utils/constants";
import { hasItBeenXWeeks } from "../General/time-checks";

const checkReminderNeeded = async (
  data: FlattenedData,
  logger: Logger
): Promise<TimePeriod | null> => {
  const deliveryDate = normalizeDate(data.deliveryDate);
  const lastSent = data.lastSent;

  for (const timePeriod of TIME_PERIODS) {
    if (timePeriod === lastSent) break; // We have already sent a form out for this time period
    const timeAmount = parseInt(timePeriod.slice(0, 1)); // The units of time (is a number)

    const milestone = normalizeDate(
      moment().subtract(timeAmount, getTimeUnit(timePeriod))
    ); // The current date minus the time units (ex. the date 6 months ago)

    // Is the delivery date before the milestone?
    /* Also, if its X weeks too late to send an email for a certain time period, it won't send a reminder email */

    if (
      milestone > deliveryDate &&
      !hasItBeenXWeeks(deliveryDate, milestone, timePeriodExpiryInWeeks)
    ) {
      await logger.info(
        `Reminder Email needed. (${READABLE_TIME_PERIODS[timePeriod]})`,
        { writeToFile: true }
      );
      return timePeriod;
    } else if (
      milestone > deliveryDate &&
      hasItBeenXWeeks(deliveryDate, milestone, timePeriodExpiryInWeeks)
    ) {
      await logger.warn(
        `Reminder Email was not sent in time. It's been more than ${timePeriodExpiryInWeeks} weeks since ${READABLE_TIME_PERIODS[timePeriod]} passed.`,
        { writeToFile: true }
      );
      break;
    }
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
