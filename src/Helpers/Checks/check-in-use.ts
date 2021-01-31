// Externals
import { default as AirtableRecord } from "airtable/lib/record";

// Internals
import Logger from "../Logger";
import { DATA_FIELDS, FIELDS } from "../../Utils/constants";
import { ProjectStatus } from "../../Utils/types";

const checkInUse = async (
  successData: AirtableRecord[],
  project: AirtableRecord
): Promise<boolean> => {
  for (const data of successData) {
    const inUseResponse = data.get(DATA_FIELDS.isStillUsing);

    if (inUseResponse === "No") {
      const abandonded: ProjectStatus = "Abandoned by Nonprofit";

      Logger.warning(
        `Not in use by nonprofit. Status updated as '${abandonded}'. No actions performed.`
      );

      await project.updateFields({
        [FIELDS.projectStatus]: abandonded,
      });

      return false;
    }
  }

  return true;
};

export default checkInUse;
