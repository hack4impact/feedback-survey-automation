import { TimePeriod } from "../../../../Utils/types";

export type FormID = string;

export type ProjectID = string;

export type SentDate = number;

export type RespondedStatus = "Yes" | "No" | "Reminder Sent" | "Expired";

export type FormEditLink = string;

export type RowArr = [
  FormID,
  ProjectID,
  TimePeriod,
  SentDate,
  RespondedStatus,
  FormEditLink
];

export interface RowObj {
  formId: FormID;
  projectId: ProjectID;
  timePeriod: TimePeriod;
  sentDate: SentDate;
  responded: RespondedStatus;
  formEditLink: FormEditLink;
}
