// Externals
import { readFile } from "fs/promises";
import { join } from "path";
import { green } from "chalk";

// Internals
import { setUpEmail } from "./index";
import { TimePeriod } from "../../Utils/types";

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
const sendNonprofitMail = async (
  nonprofitEmail: string,
  projectName: string,
  nonprofitName: string,
  nonprofitContactName: string,
  formPublishedUrl: string,
  timePeriod: TimePeriod
): Promise<MailResponse> => {
  const transporter = setUpEmail();

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
    "nonprofit-name": nonprofitName,
    "form-published-url": formPublishedUrl,
    "project-name": projectName,
  };

  Object.entries(HTML_TEMPLATE_VARIABLES).forEach(([key, value]) => {
    htmlTemplate = htmlTemplate.replace(
      new RegExp(`\\$\\{\\{${key}\\}\\}`, "g"),
      value
    );
  });

  const result: MailResponse = await transporter.sendMail({
    from: '"Hack4Impact" <contact@hack4impact.org>',
    to: `"${nonprofitContactName}" <${nonprofitEmail}>`,
    subject: `${projectName} Feedback Survey`,
    html: htmlTemplate,
  });

  console.log(
    `${green(
      `Email sent to '${nonprofitName}' for feedback on project '${projectName}'!`
    )} (Time Period: ${timePeriod})`
  );

  return result;
};

export default sendNonprofitMail;
