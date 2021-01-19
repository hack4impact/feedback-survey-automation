export const FIELDS = {
  // Basic
  name: "Project Name",
  chapter: "Chapter",
  semester: "Creation Semester",
  releaseDate: "(Anticipated) Delivery Date",
  lastSent: "Last Sent Out",

  // Project
  leads: "Project Leads (PM, Tech Lead, Designer)",
  status: "Project Status",
  members: "Team Members",

  // Nonprofit
  nonprofitName: "Nonprofit Partner Name",
  nonprofitWebsite: "Nonprofit Partner Website",
  nonprofitFocus: "Nonprofit Focus",
  nonprofitContactName: "Nonprofit Point of Contact Name",
  nonprofitContactEmail: "Nonprofit Point of Contact Email",

  // Misc
  questions: [...Array(8)].map((x, i) => `Success Metric Question ${i + 1}`),
  googleFormUrl: "Google Form URL",
};

export const SPREADSHEET_ID = "11O5zz8ff1GpWQrGdnmy973Wc7NoU3G_-RHoaFULa4Gk";
