// Externals
import { readFile } from "fs/promises";
import { join } from "path";
import { green } from "chalk";

// Internals
import { setUpEmail } from "./index";
import { ProjectData, TimePeriod } from "../../Utils/types";

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
  data: ProjectData,
  timePeriod: TimePeriod
): Promise<MailResponse> => {
  const transporter = setUpEmail();
  const email = await setUpTemplate(data);

  const potentialSends = [data.registrerEmail, data.chapterEmail?.[0]];
  const sendTo: string[] = [];

  potentialSends.forEach((potential) => {
    if (typeof potential === "string") sendTo.push(potential);
  });

  const result: MailResponse = await transporter.sendMail({
    from: '"Hack4Impact" <contact@hack4impact.org>',
    to: sendTo,
    subject: `${data.projectName} Feedback Survey Reminder`,
    html: email,
  });

  console.log(
    `${green(
      `Email sent to '${sendTo}' as a reminder for feedback on '${data.projectName}'!`
    )} (Time Period: ${timePeriod})`
  );

  return result;
};

const setUpTemplate = async (data: ProjectData) => {
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
    "nonprofit-name": data.nonprofitName,
    "form-published-url": data.googleFormPublishedUrl,
    "project-name": data.projectName,
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
