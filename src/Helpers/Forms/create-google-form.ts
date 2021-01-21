// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import { FIELDS } from "../../Utils/constants";
import { GoogleFormData, ProjectData } from "../../Utils/types";
import { green } from "chalk";

const createGoogleForm = async (
  record: Record,
  data: ProjectData,
  projectId: string
): Promise<GoogleFormData> => {
  const formData = await fetchGoogleForm(
    data.projectName as string,
    projectId,
    data.questions as string[]
  );

  console.log(
    `${green(
      `Google Form created for '${data.projectName}'!`
    )} View published form: ${formData.publishedUrl}`
  );

  record = await record.updateFields({
    [FIELDS.googleFormPublishedUrl]: formData.publishedUrl,
    [FIELDS.googleFormEditUrl]: formData.editUrl,
  });

  return formData;
};

const fetchGoogleForm = async (
  projectName: string,
  projectId: string,
  questions: string[]
): Promise<GoogleFormData> => {
  const scriptURL = process.env.APPS_SCRIPT_URL as string;
  const data = await fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: process.env.APPS_SCRIPT_PASSWORD,
      projectName,
      projectId,
      questions,
    }),
  });

  if (!data.ok) {
    console.error(data);
    process.exit(1);
  }

  const dataText = await data.text();
  if (dataText === "Unauthorized")
    throw new Error("The APPS_SCRIPT_PASSWORD is incorrect");
  const formData = JSON.parse(dataText);

  return formData;
};

export default createGoogleForm;
