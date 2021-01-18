// Externals
import moment from "moment";

const normalizeDate = (date: Date | string | number): number => {
  if (typeof date === "string") {
    date = parseInt(moment(date).format("x"));
  } else if (date instanceof Date) {
    date = date.getTime();
  }

  return date;
};

export default normalizeDate;
