// Externals
import fetch from "node-fetch";
import Record from "airtable/lib/record";

// Internals
import Logger from "../Logger";
import {
  createPublishedURLField,
  FIELDS,
  READABLE_TIME_PERIODS,
  APPS_SCRIPT_ERRORS,
} from "../../Utils/constants";
import {
  FlattenedData,
  GoogleFormData,
  GoogleFormPostData,
  LogLabel,
  TimePeriod,
} from "../../Utils/types";

const createGoogleForm = async (
  project: Record,
  data: FlattenedData,
  timePeriod: TimePeriod,
  dryRun: boolean,
  logger: Logger
): Promise<GoogleFormData> => {
  const projectId = project.getId();
  const formData = await fetchGoogleForm(
    data,
    projectId,
    timePeriod,
    dryRun,
    logger
  );

  await logger.success(
    `Google Form created! (${READABLE_TIME_PERIODS[timePeriod]})`,
    {
      extra: { ...formData, label: "googleFormCreated" as LogLabel },
    }
  );

  const expectedUrlField = createPublishedURLField(timePeriod);

  const publishedUrlField = FIELDS.googleFormPublishedUrls.find(
    (val) => val === expectedUrlField
  );

  if (publishedUrlField === undefined)
    throw new Error(
      `Unable to find Google Form Published URL field: '${expectedUrlField}'`
    );

  if (!dryRun) {
    await project.updateFields({
      [publishedUrlField]: formData.publishedUrl,
    });
  }

  data[publishedUrlField] = formData.publishedUrl;

  return formData;
};

const fetchGoogleForm = async (
  projectData: FlattenedData,
  projectId: string,
  timePeriod: TimePeriod,
  dryRun: boolean,
  logger: Logger
): Promise<GoogleFormData> => {
  const scriptURL = process.env.APPS_SCRIPT_URL as string;

  const body: GoogleFormPostData = {
    password: process.env.APPS_SCRIPT_PASSWORD ?? "",
    projectData,
    projectId,
    timePeriod,
    dryRun,
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
    await logger.error(dataText, {
      extra: { ...body, label: "formParseError" as LogLabel },
    });
    throw new Error(e);
  }
};

export default createGoogleForm;
