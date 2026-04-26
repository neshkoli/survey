/** Map URL ?form= slug to Google Sheet tab name (future GAS). */
export const FORM_TAB_MAP: Record<string, string> = {
  shirut: "Survey_Service",
  contact: "Survey_Contact",
  libi: "libi",
};

export function resolveTabName(formParam: string): string {
  return FORM_TAB_MAP[formParam] ?? formParam;
}

export function useMockData(): boolean {
  const v = import.meta.env.VITE_USE_MOCK;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return import.meta.env.DEV;
}

export function gasBaseUrl(): string | undefined {
  const u = import.meta.env.VITE_GAS_BASE_URL?.replace(/\/$/, "");
  return u || undefined;
}

/** True when the app will call Apps Script (not only mock) for schema + submit. */
export function isLiveToSheets(): boolean {
  return !useMockData() && Boolean(gasBaseUrl());
}
