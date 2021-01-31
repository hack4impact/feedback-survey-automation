// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import Logger from "../Logger";
import { createPublishedURLField, FIELDS } from "../../Utils/constants";
import {
  APPS_SCRIPT_ERRORS,
  CheckedData,
  GoogleFormData,
  GoogleFormPostData,
  TimePeriod,
} from "../../Utils/types";
import { READABLE_TIME_PERIODS } from "../AppsScript/src/form-data";

const createGoogleForm = async (
  project: Record,
  data: CheckedData,
  projectId: string,
  timePeriod: TimePeriod
): Promise<GoogleFormData> => {
  const formData = await fetchGoogleForm(data, projectId, timePeriod);

  Logger.success(
    `Google Form created! (${READABLE_TIME_PERIODS[timePeriod]})`,
    formData
  );

  const expectedUrlField = createPublishedURLField(timePeriod);

  const publishedUrlField = FIELDS.googleFormPublishedUrls.find(
    (val) => val === expectedUrlField
  );

  if (publishedUrlField === undefined)
    throw new Error(
      `Unable to find Google Form Published URL field: '${expectedUrlField}'`
    );

  project = await project.updateFields({
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
    await Logger.error(dataText, body);
    throw new Error(e);
  }
};

export default createGoogleForm;
