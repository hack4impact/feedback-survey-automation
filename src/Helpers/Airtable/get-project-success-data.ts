const getProjectSuccessData = async (
  table: Airtable.Base,
  dataIds?: string[]
): Promise<Airtable.Record<unknown>[]> => {
  if (!Array.isArray(dataIds)) return [];

  const projectSuccessData = await Promise.all(
    dataIds.map((id) => {
      return table("Project Success Data").find(id);
    })
  );

  return projectSuccessData;
};

export default getProjectSuccessData;
