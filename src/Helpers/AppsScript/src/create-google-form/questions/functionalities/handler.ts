import {
  FormQuestion,
  Functionality,
  FunctionalityArgs,
} from "../../../../../../Utils/types";
import submitIfNo from "./submit-if-no";
import onboardedLogic from "./onboarded-logic";

// this handler is for form question creation/modification, not for all functionalities
const functionalityHandler = (
  question: FormQuestion,
  functionality: Functionality,
  args: FunctionalityArgs | null = null
): any => {
  switch (functionality) {
    //Submit if no doesn't create answerchoices, only adds the submit if no functionality to the exixting ones
    case "SubmitIfNo":
      submitIfNo(question as GoogleAppsScript.Forms.MultipleChoiceItem);
      break;
    case "OnboardedLogic":
      if (args?.form && args.enableFunctionality === true) {
        onboardedLogic(question as GoogleAppsScript.Forms.MultipleChoiceItem, {
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

export default functionalityHandler;
