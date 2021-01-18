// Externals
import moment from "moment";

const daysSince = (date: Date | number | string) => {
  if (typeof date === "string") {
    date = parseInt(moment(date).format("x"));
  } else if (date instanceof Date) {
    date = date.getTime();
  }

  const diff = moment.now() - date;

  return (diff / 1000 / 60 / 60 / 24).toFixed(0);
};

export default daysSince;
