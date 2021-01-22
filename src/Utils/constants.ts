// Internals
import { TimePeriod } from "./types";

export const FIELDS = {
  // Register Info
  registrerName: "Registrer Name",
  registrerEmail: "Registrer Email",

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
  standardQuestions: [],
  googleFormPublishedUrl: "Google Form Published URL",
  googleFormEditUrl: "Google Form Edit URL",
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
};

export const SPREADSHEET_ID = "11O5zz8ff1GpWQrGdnmy973Wc7NoU3G_-RHoaFULa4Gk";

export const READABLE_TIME_PERIODS: Record<TimePeriod, string> = {
  "1m": "1 month",
  "6m": "6 months",
  "1y": "1 year",
  "3y": "3 years",
  "5y": "5 years",
};
