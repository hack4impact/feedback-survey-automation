import {
  FormQuestion,
  Functionality,
  FunctionalityArgs,
} from "../../../../../Utils/types";
import { SubmitIfNo } from "./SubmitIfNo";
import { OnboardedLogic } from "./OnboardedLogic";

// this handler is for formquestion creation/modification, not for all functionalities
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const HandleCreationFunctionality = (
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
      if (args?.form && args.enableFunctionality === true) {
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
