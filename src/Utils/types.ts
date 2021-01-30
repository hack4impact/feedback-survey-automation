// Externals
import { Moment } from "moment";

// Internals
import { FIELDS } from "./constants";

export type ProjectData = Record<keyof typeof FIELDS, string | string[]>;

interface CheckedFields {
  projectName: string;
  deliveryDate: string;
  projectStatus?: ProjectStatus;
  projectSuccessData?: string[];
  lastSent?: TimePeriod;
}

export type CheckedData = Omit<ProjectData, keyof CheckedFields> &
  CheckedFields;

export type ProjectStatus =
  | "In Progress"
  | "Delivered"
  | "Abandoned by Dev Team"
  | "Abandoned by Nonprofit"
  | "Unknown";

// For looping through project statuses
export const PROJECT_STATUSES: ProjectStatus[] = [
  "In Progress",
  "Delivered",
  "Abandoned by Dev Team",
  "Abandoned by Nonprofit",
  "Unknown",
];

export type TimePeriod = "1m" | "6m" | "1y" | "3y" | "5y";

// For looping through time periods (MUST be largest to smallest)
export const TIME_PERIODS: TimePeriod[] = ["5y", "3y", "1y", "6m", "1m"];

export interface GoogleFormData {
  id: string;
  title: string;
  description: string;
  editUrl: string;
  publishedUrl: string;
  summaryUrl: string;
}

export interface GoogleFormPostData {
  password: string;
  projectData: CheckedData;
  projectId: string;
  timePeriod: TimePeriod;
}

export type AppsScriptError =
  | "No Project ID found"
  | "No Project Name found"
  | "Wrong APPS_SCRIPT_PASSWORD"
  | "No Success Metric Questions found"
  | "No Time Period Found";

export const APPS_SCRIPT_ERRORS: AppsScriptError[] = [
  "No Project ID found",
  "No Project Name found",
  "Wrong APPS_SCRIPT_PASSWORD",
  "No Success Metric Questions found",
  "No Time Period Found",
];

export interface StandardQuestion {
  id: string;
  fields: StandardQuestionFields;
  createdTime: string;
}

export interface StandardQuestionFields {
  Question: string;
  Type?: "Single Line Text" | "Multi Line Text" | "Integer" | "Yes/No" | "0-10";
  "Time Periods"?: TimePeriod[];
  Order?: number;
  Required?: "True" | "False";
}

export type DateParameter = Date | Moment | number | string;
