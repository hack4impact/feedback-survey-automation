import { MiscQuestion, TimePeriod } from "./types";

// START CONSTANTS

export const READABLE_TIME_PERIODS = {
  "1m": "1 month",
  "6m": "6 months",
  "1y": "1 year",
  "3y": "3 years",
  "5y": "5 years",
} as const;

export const createPublishedURLField = (timePeriod: TimePeriod): string =>
  `(${timePeriod}) Google Form Published URL`;

// For looping through time periods (MUST be largest to smallest)
export const TIME_PERIODS = ["5y", "3y", "1y", "6m", "1m"] as const;

export const timePeriodExpiryInWeeks = 4;

export const FIELDS = {
  // Register Info
  representativeName: "Representative Name",
  representativeEmail: "Representative Email",

  // Project Info
  projectName: "Project Name",
  projectStatus: "Project Status",
  teamMembers: "Team Members",
  deliveryDate: "(Anticipated) Delivery Date",
  creationSemester: "Creation Semester",
  projectLeads: "Project Leads (PM, Tech Lead, Designer)",
  prd: "PRD",

  // Questions Info
  successQuestions: [...Array(8)].map(
    (x, i) => `Success Metric Question ${i + 1}`
  ),
  googleFormPublishedUrls: TIME_PERIODS.map(createPublishedURLField),
  lastSent: "Last Sent Out",
  projectSuccessData: "Project Success Data",

  // Chapter Info
  chapter: "Chapter",
  chapterName: "Chapter Name",
  chapterEmail: "Chapter Email",

  // Nonprofit
  nonprofitName: "Nonprofit Partner Name",
  nonprofitWebsite: "Nonprofit Partner Website",
  nonprofitFocus: "Nonprofit Focus",
  nonprofitContactName: "Nonprofit Point of Contact Name",
  nonprofitContactEmail: "Nonprofit Point of Contact Email",
  willingToInterview: "Willing to Interview?",
  onboarded: "Onboarded?",
} as const;

export const DATA_FIELDS = {
  // Project Info
  project: "Project",
  projectName: "Project Name",

  // Response Info
  responderEmail: "Responder Email",
  responderName: "Responder Name",
  timePeriod: "Response Time Period",
  feedbackDate: "Feedback Date",

  // Usage Info
  isStillUsing: "Are you still using the product?",
  willEverUse:
    "If you have not yet started using the product, do you plan on trying to using it in the future?",
};

export const STANDARD_QUESTIONS = {
  startedUsing: "Have you successfully started using the product?",
};

export const MISC_QUESTIONS: MiscQuestion[] = [
  {
    title: "Your Name",
    required: true,
    field: DATA_FIELDS.responderName,
  },
];

// END CONSTANTS

// For looping through project statuses
export const PROJECT_STATUSES = [
  "In Progress",
  "Delivered",
  "Abandoned by Dev Team",
  "Abandoned by Nonprofit",
  "Unknown",
] as const;

export const APPS_SCRIPT_ERRORS = [
  "No Project ID found",
  "No Project Name found",
  "No Success Metric Questions found",
  "No Time Period Found",
] as const;
