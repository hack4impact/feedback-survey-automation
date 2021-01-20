// Externals
import { readFile } from "fs/promises";
import { join } from "path";

// Internals
import { setUpEmail } from "./index";

//check sent messages from test account here: https://ethereal.email/ (login with the user and pass in createTransport)
const sendNonprofitMail = async (
  nonprofitEmail: string,
  projectName: string,
  nonprofitName: string,
  nonprofitContactName: string
): Promise<void> => {
  const transporter = setUpEmail();

  let htmlTemplate = await readFile(
    join(__dirname, "..", "..", "..", "static", "mail-template.html"),
    "utf-8"
  );

  const HTML_TEMPLATE_VARIABLES = {
    "nonprofit-name": nonprofitName,
  };

  Object.entries(HTML_TEMPLATE_VARIABLES).forEach(([key, value]) => {
    htmlTemplate = htmlTemplate.replace(
      new RegExp(`\\$\\{\\{${key}\\}\\}`, "g"),
      value
    );
  });

  const result = await transporter.sendMail({
    from: '"Hack4Impact" <contact@hack4impact.org>',
    to: `"${nonprofitContactName}" <${nonprofitEmail}>`,
    subject: `${projectName} Feedback Survey`,
    html: htmlTemplate,
  });

  console.log(result);
};

export default sendNonprofitMail;
