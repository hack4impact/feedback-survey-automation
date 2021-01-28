// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import { createPublishedURLField, FIELDS } from "../../Utils/constants";
import {
  APPS_SCRIPT_ERRORS,
  CheckedData,
  GoogleFormData,
  GoogleFormPostData,
  TimePeriod,
} from "../../Utils/types";
import { green } from "chalk";

const createGoogleForm = async (
  record: Record,
  data: CheckedData,
  projectId: string,
  timePeriod: TimePeriod
): Promise<GoogleFormData> => {
  const formData = await fetchGoogleForm(data, projectId, timePeriod);

  console.log(green(`Google Form created for '${data.projectName}'!`));
  console.log(`Published URL: ${formData.publishedUrl}`);

  const expectedUrlField = createPublishedURLField(timePeriod);

  const publishedUrlField = FIELDS.googleFormPublishedUrls.find(
    (val) => val === expectedUrlField
  );

  if (publishedUrlField === undefined)
    throw new Error(
      `Unable to find Google Form Published URL field: '${expectedUrlField}'`
    );

  record = await record.updateFields({
    [publishedUrlField]: formData.publishedUrl,
  });

  data[publishedUrlField] = formData.publishedUrl;

  return formData;
};

const fetchGoogleForm = async (
  projectData: CheckedData,
  projectId: string,
  timePeriod: TimePeriod
): Promise<GoogleFormData> => {
  const scriptURL = process.env.APPS_SCRIPT_URL as string;

  const body: GoogleFormPostData = {
    password: process.env.APPS_SCRIPT_PASSWORD ?? "",
    projectData,
    projectId,
    timePeriod,
  };

  const data = await fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const dataText = await data.text();

  APPS_SCRIPT_ERRORS.forEach((err) => {
    if (dataText === err) throw new Error(err);
  });

  try {
    const formData = JSON.parse(dataText);
    return formData;
  } catch (e) {
    console.log(dataText);
    throw new Error(e);
  }
};

export default createGoogleForm;
