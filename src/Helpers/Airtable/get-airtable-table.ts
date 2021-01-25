// Externals
import Query from "airtable/lib/query";

const getAirtableTable = (
  airtable: Airtable.Base,
  tableName: string,
  callback: Parameters<Query["eachPage"]>[0]
): Promise<void> => {
  return airtable(tableName).select().eachPage(callback);
};

export default getAirtableTable;
