// Externals
import { readFile } from "fs/promises";
import { join } from "path";
import { htmlToText } from "html-to-text";

// Internals
import { escapeRegex } from "./index";
import {
  createPublishedURLField,
  READABLE_TIME_PERIODS,
} from "../../Utils/constants";
import { FlattenedData, TimePeriod } from "../../Utils/types";

const getTemplate = async (
  template: string,
  data: FlattenedData,
  timePeriod: TimePeriod
): Promise<[string, string]> => {
  let htmlTemplate = await readFile(
    join(
      __dirname,
      "..",
      "..",
      "..",
      "static",
      "templates",
      `${template}.html`
    ),
    "utf-8"
  );

  const HTML_TEMPLATE_VARIABLES = {
    "project-name": data.projectName,
    "nonprofit-name": data.nonprofitName,
    "chapter-name": data.chapterName,
    "nonprofit-contact-name|nonprofit-name":
      data.nonprofitContactName ?? data.nonprofitName,
    "nonprofit-contact-name": data.nonprofitContactName ?? "Unknown",
    "nonprofit-contact-email": data.nonprofitContactEmail ?? "Unknown",
    "creation-semester": data.creationSemester ?? "Unknown",
    "form-published-url":
      data[createPublishedURLField(timePeriod)] ?? "Unknown",
    "readable-time-period":
      READABLE_TIME_PERIODS[timePeriod] ?? "Unknown Time Period",
    "airtable-base-id": process.env.AIRTABLE_BASE_ID,
  };

  Object.entries(HTML_TEMPLATE_VARIABLES).forEach(([key, value]) => {
    htmlTemplate = htmlTemplate.replace(
      new RegExp(escapeRegex(`\${{${key}}}`), "g"),
      value as string
    );
  });

  return [htmlTemplate, htmlToText(htmlTemplate)];
};

export default getTemplate;
