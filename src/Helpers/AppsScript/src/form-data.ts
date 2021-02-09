import { READABLE_TIME_PERIODS } from "../../../Utils/constants";
import { FlattenedData, TimePeriod } from "../../../Utils/types";

// START FIELDS
// END FIELDS

const TEMPLATE_FORM_ID = "1t4ZcYi3iMO1FJ8oa5qw8MQaOBFTZymqXmd6KHiAgBfs";

export const initializeForm = (
  projectData: FlattenedData,
  timePeriod: TimePeriod
): GoogleAppsScript.Forms.Form => {
  const title = `${projectData.projectName} Feedback Survey - ${READABLE_TIME_PERIODS[timePeriod]}`;

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
