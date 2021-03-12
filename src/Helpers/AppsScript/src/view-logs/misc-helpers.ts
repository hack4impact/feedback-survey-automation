export const getAllDatesInRange = (date1: string, date2: string): string[] => {
  const allDates: string[] = [];
  const [startyear, startmonth, startday] = date1
    .split("-")
    .map((d) => parseInt(d));
  const [endyear, endmonth, endday] = date2.split("-").map((d) => parseInt(d));

  let day = startday;
  let year = startyear;
  let month = startmonth;
  for (year; year <= endyear; year++) {
    for (month = month >= 13 ? 1 : month; month <= 12; month++) {
      for (day = day >= 32 ? 1 : day; day <= 31; day++) {
        allDates.push(
          `${year}-${month / 10 < 1 ? `0${month}` : month}-${
            day / 10 < 1 ? `0${day}` : day
          }`
        );

        if (year === endyear && month === endmonth && day === endday)
          return allDates;
      }
    }
  }
  return allDates;
};

export const validateDateFormat = (date: string | undefined): boolean => {
  if (!date) return false;
  const regex = RegExp(
    /^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31)$/
  );
  return regex.test(date);
};

export const include = (filename: string): string => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};

export const parseDateFromUrlForm = (dateString: string): Date | null => {
  if (!validateDateFormat(dateString)) return null;
  // eslint-disable-next-line prefer-const
  let [year, month, day] = dateString.split("-").map((part) => parseInt(part));
  month--;
  return new Date(year, month, day);
};
