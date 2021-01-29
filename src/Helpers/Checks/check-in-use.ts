// Externals
import { default as AirtableRecord } from "airtable/lib/record";
import { yellow } from "chalk";

// Internals
import { DATA_FIELDS, FIELDS } from "../../Utils/constants";
import { ProjectStatus } from "../../Utils/types";

const checkInUse = async (
  successData: AirtableRecord[],
  project: AirtableRecord
): Promise<boolean> => {
  for (const data of successData) {
    const inUseResponse = data.get(DATA_FIELDS.isStillUsing);
    const projectName = data.get(DATA_FIELDS.projectName);

    if (inUseResponse === "No") {
      console.log(
        yellow(
          `${projectName} is not in use anymore. Feedback forms and reminder emails for this project will cease.`
        )
      );

      await project.updateFields({
        [FIELDS.projectStatus]: "Abandoned by Nonprofit" as ProjectStatus,
      });

      return false;
    }
  }

  return true;
};

export default checkInUse;
