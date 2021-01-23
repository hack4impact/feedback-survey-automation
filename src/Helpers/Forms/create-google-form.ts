// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import { FIELDS } from "../../Utils/constants";
import {
  APPS_SCRIPT_ERRORS,
  GoogleFormData,
  GoogleFormPostData,
  ProjectData,
} from "../../Utils/types";
import { green } from "chalk";

const createGoogleForm = async (
  record: Record,
  data: ProjectData,
  projectId: string
): Promise<GoogleFormData> => {
  const formData = await fetchGoogleForm(data, projectId);

  console.log(green(`Google Form created for '${data.projectName}'!`));
  console.log(formData);

  record = await record.updateFields({
    [FIELDS.googleFormPublishedUrl]: formData.publishedUrl,
    [FIELDS.googleFormEditUrl]: formData.editUrl,
  });

  return formData;
};

const fetchGoogleForm = async (
  projectData: ProjectData,
  projectId: string
): Promise<GoogleFormData> => {
  const scriptURL = process.env.APPS_SCRIPT_URL as string;
  const data = await fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: process.env.APPS_SCRIPT_PASSWORD,
      projectData: projectData,
      projectId,
    } as GoogleFormPostData),
  });

  if (!data.ok) {
    console.error(data);
    process.exit(1);
  }

  const dataText = await data.text();

  APPS_SCRIPT_ERRORS.forEach((err) => {
    if (dataText === err) throw new Error(err);
  });
  const formData = JSON.parse(dataText);

  return formData;
};

export default createGoogleForm;
