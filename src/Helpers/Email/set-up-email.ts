// Externals
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

let transporter: Mail;

const setUpEmail = (): Mail => {
  if (!transporter)
    transporter = createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "citlalli.cummerata@ethereal.email", // generated ethereal user
        pass: "EcGmzRxPWK4JBQdzMk", // generated ethereal password
      },
    });

  return transporter;
};

export default setUpEmail;
