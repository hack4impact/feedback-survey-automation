import { CheckedData, TimePeriod } from "../../../Utils/types";

const TEMPLATE_FORM_ID = "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs";

const _READABLE_TIME_PERIODS: Record<TimePeriod, string> = {
  "1m": "1 month",
  "6m": "6 months",
  "1y": "1 year",
  "3y": "3 years",
  "5y": "5 years",
};

// Can only export it this way because exporting a variable (not a function) masks the variable when the Apps Scripts are compiled
export const READABLE_TIME_PERIODS = { ..._READABLE_TIME_PERIODS };

export const initializeForm = (
  projectData: CheckedData,
  timePeriod: TimePeriod
): GoogleAppsScript.Forms.Form => {
  const title = `${projectData.projectName} Feedback Survey - ${_READABLE_TIME_PERIODS[timePeriod]}`;

  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(
      title,
      DriveApp.getFolderById("1fWj2K9WAQSxpC9jyOZkRfmOvY186I1Xf")
    )
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(title);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(false);
  form.setDescription(
    `Please fill out this feedback survey for the project ${projectData.projectName} that the Hack4Impact chapter at ${projectData.chapterName} created for your nonprofit ${projectData.nonprofitName}. This information helps us serve our clients better in the future.`
  );

  return form;
};
