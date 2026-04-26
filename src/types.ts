export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "select"
  | "checkbox"
  | "radio";

export interface FieldDef {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

/** Matches planned Apps Script `schema` response */
export interface SurveySchema {
  form: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  /** Closing note (e.g. 3-col "End" row in the sheet) */
  footerText?: string;
  fields: FieldDef[];
}

export type Answers = Record<string, string | number | boolean>;

export interface ResponseRow {
  timestamp: string;
  answers: Answers;
}

export interface ResponsesPayload {
  form: string;
  title: string;
  fields: FieldDef[];
  rows: ResponseRow[];
}
