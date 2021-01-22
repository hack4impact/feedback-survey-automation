// Externals
import Query from "airtable/lib/query";

const getAirtableTable = (
  airtable: ReturnType<typeof Airtable.base>,
  tableName: string,
  callback: Parameters<Query["eachPage"]>[0]
): Promise<void> => {
  return airtable(tableName).select().eachPage(callback);
};

export default getAirtableTable;
