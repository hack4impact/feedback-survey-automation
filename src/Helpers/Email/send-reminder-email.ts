// Externals
import { readFile } from "fs/promises";
import { join } from "path";

// Internals
import { setUpEmail } from "./index";
import { escapeRegex } from "../General";
import Logger from "../Logger";
import { FlattenedData, TimePeriod } from "../../Utils/types";
import { createPublishedURLField } from "../../Utils/constants";
import { READABLE_TIME_PERIODS } from "../AppsScript/src/form-data";

interface MailResponse {
  accepted: string[];
  rejected: string[];
  response: string;
  messageTime: number;
  messageSize: number;
  messageId: string;
  envelopeTime: number;
  envelope: {
    from: string;
    to: string[];
  };
}

//check sent messages from test account here: https://ethereal.email/ (login with the user and pass in createTransport)
const sendReminderEmail = async (
  data: FlattenedData,
  timePeriod: TimePeriod
): Promise<MailResponse> => {
  const transporter = setUpEmail();
  const email = await setUpTemplate(data, timePeriod);

  const sendTo = [data.representativeEmail, data.chapterEmail?.[0]].filter(
    (potential): potential is string => typeof potential === "string"
  );

  const result: MailResponse = await transporter.sendMail({
    from: "contact@hack4impact.org",
    to: sendTo,
    subject: `Feedback Reminder for ${data.projectName}`,
    html: email,
  });

  Logger.success(
    `Reminder Email sent! (${READABLE_TIME_PERIODS[timePeriod]})`,
    {
      content: email,
      recipients: sendTo,
    }
  );

  return result;
};

const setUpTemplate = async (data: FlattenedData, timePeriod: TimePeriod) => {
  let htmlTemplate = await readFile(
    join(
      __dirname,
      "..",
      "..",
      "..",
      "static",
      "templates",
      "mail-template.html"
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

export default sendReminderEmail;
