// Externals
import Airtable from "airtable";
import { default as AirtableRecord } from "airtable/lib/record";

const getProjectSuccessData = async (
  table: ReturnType<typeof Airtable.base>,
  dataIds?: string[]
): Promise<AirtableRecord[]> => {
  if (!Array.isArray(dataIds)) return [];

  const projectSuccessData = await Promise.all(
    dataIds.map((id) => {
      return table("Project Success Data").find(id);
    })
  );

  return projectSuccessData;
};

export default getProjectSuccessData;
