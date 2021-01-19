export type Chapter =
  | "Cal Poly"
  | "Georgia Tech"
  | "Cornell"
  | "University of Maryland College Park"
  | "Boston University"
  | "University of Pennsylvania"
  | "McGill University"
  | "UIUC"
  | "Univ of Tennessee"
  | "Univ of Michigan"
  | "Carleton College"
  | "Drexel University"
  | "Princeton University";

export type ProjectStatus =
  | "In Progress"
  | "Delivered"
  | "Abandoned by Dev Team"
  | "Abandoned by Nonprofit"
  | "Unknown";

export type NonprofitFocus =
  | "Environmental Justice"
  | "Racial Justice"
  | "Political"
  | "Environmental Issues"
  | "Education"
  | "Poverty and Homelessness"
  | "Immigration"
  | "Gender Inequality"
  | "Healthcare"
  | "Animal Rights"
  | "LGBTQ Rights"
  | "Other"
  | "Criminal Justice";

export type WillingToInterview = "Yes" | "No" | "Unsure";

export type TimePeriod = "1m" | "6m" | "1y" | "3y" | "5y";

// For looping through time periods
export const TIME_PERIODS: TimePeriod[] = ["1m", "6m", "1y", "3y", "5y"];
