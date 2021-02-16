// Externals
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

let transporter: Mail;

const setUpEmail = (dryRun: boolean): Mail => {
  if (!transporter) {
    const host = dryRun ? "smtp.ethereal.email" : process.env.MAIL_SERVER;
    const auth = dryRun
      ? {
          user: "citlalli.cummerata@ethereal.email", // generated ethereal user
          pass: "EcGmzRxPWK4JBQdzMk", // generated ethereal password
        }
      : {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        };
    transporter = createTransport({
      host,
      port: dryRun ? 587 : 465,
      secure: !dryRun, // true for 465, false for other ports
      auth,
    });
  }

  return transporter;
};

export default setUpEmail;
