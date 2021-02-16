export const hasItBeenXWeeks = (
  previousDate: number,
  laterDate: number,
  weeks: number
): boolean => {
  return laterDate > previousDate + weeks * 604800000;
};
