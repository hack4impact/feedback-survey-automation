import { SubmitIfNo } from "./SubmitIfNo";
import {
  FormQuestion,
  Functionality,
  FunctionalityArgs,
} from "../../../../../Utils/types";
import { OnboardedLogic } from "./OnboardedLogic";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HandleFunctionality = (
  question: FormQuestion,
  functionality: Functionality,
  args: FunctionalityArgs | null = null
): any => {
  switch (functionality) {
    //Submit if no doesn't create answerchoices, only adds the submit if no functionality to the exixting ones
    case "SubmitIfNo":
      SubmitIfNo(question as GoogleAppsScript.Forms.MultipleChoiceItem);
      break;
    case "OnboardedLogic":
      if (
        args?.form &&
        args?.onboardedDefaultSections &&
        args.enableFunctionality === true
      ) {
        OnboardedLogic(question as GoogleAppsScript.Forms.MultipleChoiceItem, {
          form: args.form,
          onboardedDefaultSections: args.onboardedDefaultSections,
          enableFunctionality: args.enableFunctionality,
        });
      }
      break;
    default:
      return;
  }
};
