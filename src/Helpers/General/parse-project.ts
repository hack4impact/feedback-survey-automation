// Externals
import { default as AirtableRecord } from "airtable/lib/record";

// Internals
import { FIELDS } from "../../Utils/constants";
import { ProjectData } from "../../Utils/types";

const parseProject = (project: AirtableRecord): ProjectData => {
  return Object.entries(FIELDS).reduce((data, [key, value]) => {
    if (typeof value === "string")
      return { ...data, [key]: project.get(value) };
    if (Array.isArray(value))
      return {
        ...data,
        [key]: value.map((v) => project.get(v)).filter((v) => v !== undefined),
      };
    return data;
  }, {} as ProjectData);
};

export default parseProject;
