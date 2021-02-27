import { READABLE_TIME_PERIODS } from "../../../../Utils/constants";
import { FlattenedData, TimePeriod } from "../../../../Utils/types";

// START CONSTANTS
// END CONSTANTS

const TEMPLATE_FORM_ID = process.env.TEMPLATE_FORM_ID as string;

export const initializeForm = (
  projectData: FlattenedData,
  timePeriod: TimePeriod,
  dryRun: boolean
): GoogleAppsScript.Forms.Form => {
  const title = `${projectData.projectName} Feedback Survey - ${READABLE_TIME_PERIODS[timePeriod]}`;

  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(
      title,
      DriveApp.getFolderById(
        dryRun
          ? (process.env.DRY_RUN_FOLDER as string)
          : (process.env.PRODUCTION_FOLDER as string)
      )
    )
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(title);
  form.setDescription(
    "Our Hack4Impact team really enjoyed working with you and, in an effort to produce the best products possible for all of our nonprofit partners, would love to hear how the product has been working for your organization. If you have any questions, please don’t hesitate to reach out. Thank you for your feedback!"
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(false);
  form.setAcceptingResponses(true);
  form.setShuffleQuestions(false);
  form.setIsQuiz(false);

  return form;
};
