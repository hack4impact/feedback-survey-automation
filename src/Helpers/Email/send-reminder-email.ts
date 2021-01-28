// Externals
import { readFile } from "fs/promises";
import { join } from "path";
import { green } from "chalk";

// Internals
import { setUpEmail } from "./index";
import { CheckedData, TimePeriod } from "../../Utils/types";
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
  data: CheckedData,
  timePeriod: TimePeriod
): Promise<MailResponse> => {
  const transporter = setUpEmail();
  const email = await setUpTemplate(data, timePeriod);

  const potentialSends = [data.registrerEmail, data.chapterEmail?.[0]];
  const sendTo: string[] = [];

  potentialSends.forEach((potential) => {
    if (typeof potential === "string") sendTo.push(potential);
  });

  const result: MailResponse = await transporter.sendMail({
    from: "contact@hack4impact.org",
    to: sendTo,
    subject: `Feedback Reminder for ${data.projectName}`,
    html: email,
  });

  console.log(
    `${green(
      `Email sent to '${sendTo}' as a reminder for feedback on '${data.projectName}'!`
    )} (Time Period: ${timePeriod})`
  );

  return result;
};

const setUpTemplate = async (data: CheckedData, timePeriod: TimePeriod) => {
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
    "nonprofit-name": data.nonprofitName ?? "Unknown Nonprofit",
    "nonprofit-website": data.nonprofitWebsite ?? "Unknown",
    "nonprofit-contact-name": data.nonprofitContactName ?? "Unknown",
    "nonprofit-contact-email": data.nonprofitContactEmail ?? "Unknown",
    "nonprofit-focus": data.nonprofitFocus ?? "Unknown",
    "nonprofit-willing-to-interview": data.willingToInterview ?? "Unknown",
    "form-published-url": data.googleFormPublishedUrl,
    "project-name": data.projectName,
    "readable-time-period":
      READABLE_TIME_PERIODS[timePeriod] ?? "Unknown Time Period",
  };

  Object.entries(HTML_TEMPLATE_VARIABLES).forEach(([key, value]) => {
    htmlTemplate = htmlTemplate.replace(
      new RegExp(`\\$\\{\\{${key}\\}\\}`, "g"),
      value as string
    );
  });

  return htmlTemplate;
};

export default sendReminderEmail;
