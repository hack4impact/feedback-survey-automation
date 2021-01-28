// Externals
import { default as AirtableRecord } from "airtable/lib/record";

// Internals
import { FIELDS } from "../../Utils/constants";
import { ProjectData } from "../../Utils/types";

const parseRecord = (record: AirtableRecord): ProjectData => {
  return Object.entries(FIELDS).reduce((data, [key, value]) => {
    if (typeof value === "string") return { ...data, [key]: record.get(value) };
    if (Array.isArray(value))
      return {
        ...data,
        [key]: value.map((v) => record.get(v)).filter((v) => v !== undefined),
      };
    return data;
  }, {} as ProjectData);
};

export default parseRecord;
