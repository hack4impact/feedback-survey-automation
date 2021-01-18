// Externals
import moment, { Moment } from "moment";

export type DateParameter = Date | Moment | number | string;

const normalizeDate = (date: DateParameter): number => {
  if (typeof date === "string") {
    date = normalizeDate(moment(date));
  } else if (date instanceof Date) {
    date = date.getTime();
  } else if (moment.isMoment(date)) {
    date = parseInt(date.format("x"));
  }
  return date;
};

export default normalizeDate;
