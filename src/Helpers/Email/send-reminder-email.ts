// Internals
import { setUpEmail } from "./index";
import Logger from "../Logger";
import { getTemplate } from "../General";
import { FlattenedData, LogLabel, TimePeriod } from "../../Utils/types";
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
  timePeriod: TimePeriod,
  logger: Logger,
  dryRun: boolean
): Promise<MailResponse> => {
  const transporter = setUpEmail(dryRun);
  const [html, text] = await getTemplate("inform-mail", data, timePeriod);

  const sendTo = [data.representativeEmail, data.chapterEmail?.[0]].filter(
    (potential): potential is string => typeof potential === "string"
  );

  let result: MailResponse;
  try {
    result = await transporter.sendMail({
      from: process.env.MAIL_USERNAME,
      to: sendTo,
      subject: `Feedback Reminder for ${data.projectName}`,
      html,
      text,
    });

    await logger.log(
      `Reminder Email sent! (${READABLE_TIME_PERIODS[timePeriod]})`,
      {
        type: "success",
        extra: {
          htmlContent: html,
          textContent: text,
          result,
          label: "reminderSent" as LogLabel,
        },
      }
    );
    return result;
  } catch (e) {
    await logger.error("Incorrect mail configuration", {
      extra: {
        label: "incorrectMailConfig" as LogLabel,
        error: typeof e === "string" ? e : e.message,
      },
    });
    process.exit();
  }
};

export default sendReminderEmail;
