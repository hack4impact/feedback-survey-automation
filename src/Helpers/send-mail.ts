// Externals
import mail from "nodemailer";
import Mail from "nodemailer/lib/mailer";

// create reusable transporter object using the default SMTP transport
let transporter: Mail;

//check sent messages from test account here: https://ethereal.email/ (login with the user and pass in createTransport)
const sendMail = async (
  email: string,
  publishedFormUrl: string,
  templateType: number
): Promise<void> => {
  if (!transporter) transporter = await createTransport();
  await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Hi There", // Subject line
    text: publishedFormUrl, // plain text body
  });
};

const createTransport = async () => {
  const transporter = mail.createTransport({
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

export default sendMail;
