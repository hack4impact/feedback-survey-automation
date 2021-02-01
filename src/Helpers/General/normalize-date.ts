// Externals
import moment from "moment";

// Internals
import { DateParameter } from "../../Utils/types";

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
