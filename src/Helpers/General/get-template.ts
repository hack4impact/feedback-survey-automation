// Externals
import { readFile } from "fs/promises";
import { join } from "path";

// Internals
import { escapeRegex } from "./index";
import { createPublishedURLField } from "../../Utils/constants";
import { FlattenedData, TimePeriod } from "../../Utils/types";
import { READABLE_TIME_PERIODS } from "../AppsScript/src/form-data";

const getTemplate = async (
  template: string,
  data: FlattenedData,
  timePeriod: TimePeriod
): Promise<string> => {
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
  };

  Object.entries(HTML_TEMPLATE_VARIABLES).forEach(([key, value]) => {
    htmlTemplate = htmlTemplate.replace(
      new RegExp(escapeRegex(`\${{${key}}}`), "g"),
      value as string
    );
  });

  return htmlTemplate;
};

export default getTemplate;
