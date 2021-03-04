// Externals
import { default as AirtableRecord } from "airtable/lib/record";

// Internals
import Logger from "../Logger";
import { FIELDS } from "../../Utils/constants";
import { ProjectStatus, StandardQuestionFields } from "../../Utils/types";

const checkInUse = async (
  successData: AirtableRecord[],
  project: AirtableRecord,
  standardQuestions: AirtableRecord[],
  dryRun: boolean,
  logger: Logger
): Promise<boolean> => {
  const inUseQuestions = standardQuestions.filter((record) =>
    (record.fields as StandardQuestionFields).Functionalities?.includes(
      "StopSendingIfNo"
    )
  );

  for (const data of successData) {
    const responses = inUseQuestions.map((question) =>
      data.get((question.fields as StandardQuestionFields).Question)
    );

    if (responses.includes("No")) {
      const abandoned: ProjectStatus = "Abandoned by Nonprofit";

      await logger.warn(
        `Not in use by nonprofit. Status updated as '${abandoned}'. No actions performed.`
      );

      !dryRun &&
        (await project.updateFields({
          [FIELDS.projectStatus]: abandoned,
        }));

      return false;
    }
  }

  return true;
};

export default checkInUse;
