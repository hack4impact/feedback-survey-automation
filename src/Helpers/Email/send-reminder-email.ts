// Internals
import { setUpEmail } from "./index";
import Logger from "../Logger";
import { getTemplate } from "../General";
import { FlattenedData, TimePeriod } from "../../Utils/types";
import { READABLE_TIME_PERIODS } from "../../Utils/constants";

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
  const [html, text] = await getTemplate("inform-mail", data, timePeriod);

  const sendTo = [data.representativeEmail, data.chapterEmail?.[0]].filter(
    (potential): potential is string => typeof potential === "string"
  );

  const result: MailResponse = await transporter.sendMail({
    from: "social-impact@hack4impact.org",
    to: sendTo,
    subject: `Feedback Reminder for ${data.projectName}`,
    html,
    text,
  });

  Logger.success(
    `Reminder Email sent! (${READABLE_TIME_PERIODS[timePeriod]})`,
    {
      htmlContent: html,
      textContent: text,
      result,
    }
  );

  return result;
};

export default sendReminderEmail;
