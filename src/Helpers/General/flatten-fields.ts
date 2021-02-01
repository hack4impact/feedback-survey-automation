import { CheckedData, FlattenedData } from "../../Utils/types";

const flattenFields = (data: CheckedData): FlattenedData => {
  const flattenedData: FlattenedData = {
    ...data,
    chapter: data.chapter[0],
    chapterName: data.chapterName[0],
  };

  return flattenedData;
};

export default flattenFields;
