// Externals
import { Moment } from "moment";

// Internals
import { FIELDS } from "./constants";

export type ProjectData = Record<keyof typeof FIELDS, string | string[]>;

interface CheckedFields {
  projectName: string;
  representativeName: string;
  representativeEmail: string;
  deliveryDate: string;
  nonprofitName: string;
  chapter: [string];
  chapterName: [string];
  projectStatus?: ProjectStatus;
  projectSuccessData?: string[];
  lastSent?: TimePeriod;
}

export type CheckedData = Omit<ProjectData, keyof CheckedFields> &
  CheckedFields;

interface FlattenedFields {
  chapter: string;
  chapterName: string;
}

export type FlattenedData = Omit<CheckedData, keyof FlattenedFields> &
  FlattenedFields;

// Change the Array of Project Statuses in constants.ts when changing this as well
export type ProjectStatus =
  | "In Progress"
  | "Delivered"
  | "Abandoned by Dev Team"
  | "Abandoned by Nonprofit"
  | "Unknown";

// Change the Array of Time Periods in constants.ts when changing this as well
export type TimePeriod = "1m" | "6m" | "1y" | "3y" | "5y";

export type Functionality =
  | "SubmitIfNo"
  | "OnboardedLogic"
  | "OnboardedLogicOn1m"
  | "StopSendingIfNo";

export type FunctionalityArgs = {
  form?: GoogleAppsScript.Forms.Form;
  onboardedDefaultSections?: Section[];
  enableFunctionality?: boolean;
};

export interface GoogleFormData {
  id: string;
  title: string;
  description: string;
  editUrl: string;
  publishedUrl: string;
  summaryUrl: string;
}

export interface GoogleFormPostData {
  projectData: FlattenedData;
  projectId: string;
  timePeriod: TimePeriod;
  dryRun: boolean;
}

// Change the Array of Apps Script Errors in constants.ts when changing this as well
export type AppsScriptError =
  | "No Project ID found"
  | "No Project Name found"
  | "No Success Metric Questions found"
  | "No Time Period Found";

export interface MiscQuestion {
  title: string;
  field: string;
  required: boolean;
}

export interface StandardQuestion {
  id: string;
  fields: StandardQuestionFields;
  createdTime: string;
}

export type SectionName =
  | "Onboarded"
  | "Usage"
  | "Handoff"
  | "Misc"
  | "Success";

export interface StandardQuestionFields {
  Question: string;
  Type?:
    | "Single Line Text"
    | "Multi Line Text"
    | "Integer"
    | "Yes/No"
    | "0-10"
    | "Date";
  "Time Periods"?: TimePeriod[];
  Order?: number;
  Required?: "True" | "False";
  Section?: SectionName;
  Functionalities?: Functionality[];
}

export interface Section {
  questions: StandardQuestionFields[];
  name?: SectionName;
}

export type FormQuestion =
  | GoogleAppsScript.Forms.TextItem
  | GoogleAppsScript.Forms.MultipleChoiceItem
  | GoogleAppsScript.Forms.ScaleItem
  | GoogleAppsScript.Forms.DateItem;

export type DateParameter = Date | Moment | number | string;

export type LogLabel =
  | "falseyProjectStatus"
  | "notInUse"
  | "reminderNeeded"
  | "reminderNotSentInTime"
  | "googleFormCreated"
  | "formParseError"
  | "reminderSent"
  | "incorrectMailConfig";
