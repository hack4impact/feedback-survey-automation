// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import { FIELDS } from "../Utils/constants";
import { GoogleFormData } from "../Utils/types";

const createGoogleForm = async (
  record: Record,
  projectName: string,
  questions: string[]
): Promise<GoogleFormData> => {
  const formData = await fetchGoogleForm(projectName, questions);

  record = await record.updateFields({
    [FIELDS.googleFormUrl]: formData.publishedUrl,
  });

  return formData;
};

const fetchGoogleForm = async (
  projectName: string,
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
      questions,
    }),
  });

  const dataText = await data.text();
  if (dataText === "Unauthorized")
    throw new Error("The APPS_SCRIPT_PASSWORD is incorrect");
  const formData = JSON.parse(dataText);

  return formData;
};

export default createGoogleForm;
