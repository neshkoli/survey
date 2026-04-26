import { gasBaseUrl, resolveTabName, useMockData } from "./config";
import { getMockSchema } from "./mock/surveys";
import type { Answers, SurveySchema } from "./types";

type GasErrorPayload = { error?: string; message?: string };

function parseJsonResponse(data: unknown): SurveySchema {
  if (data && typeof data === "object" && data !== null) {
    const o = data as GasErrorPayload & { fields?: unknown };
    if (o.error) {
      const msg = o.message || o.error;
      throw new Error(typeof msg === "string" ? msg : "server error");
    }
  }
  return data as SurveySchema;
}

function schemaUrl(tabName: string): string {
  const base = gasBaseUrl();
  if (!base) throw new Error("VITE_GAS_BASE_URL is not set");
  const u = new URL(base);
  u.searchParams.set("action", "schema");
  u.searchParams.set("form", tabName);
  return u.toString();
}

function submitUrlBase(): string {
  const base = gasBaseUrl();
  if (!base) throw new Error("VITE_GAS_BASE_URL is not set");
  const u = new URL(base);
  u.searchParams.set("action", "submit");
  return u.toString();
}

export async function fetchSchema(formParam: string): Promise<SurveySchema> {
  const tabName = resolveTabName(formParam);

  if (useMockData() || !gasBaseUrl()) {
    const s = getMockSchema(tabName);
    if (s) {
      return s;
    }
    throw new Error(
      `אין נתוני mock לטאב «${tabName}». הוסיפו ב־src/mock/surveys.ts או בדקו את פרמטר form.`,
    );
  }

  const res = await fetch(schemaUrl(tabName), { method: "GET" });
  const data: unknown = await res.json();
  if (!res.ok) {
    const o = data as GasErrorPayload;
    throw new Error(o.message || o.error || `schema: ${res.status}`);
  }
  return parseJsonResponse(data);
}

export async function submitAnswers(
  formParam: string,
  tabName: string,
  answers: Answers,
): Promise<void> {
  if (useMockData() || !gasBaseUrl()) {
    await new Promise((r) => setTimeout(r, 500));
    console.log("[mock submit]", { form: formParam, tab: tabName, answers });
    return;
  }

  const token = import.meta.env.VITE_SUBMIT_TOKEN?.trim();
  const body: Record<string, unknown> = { form: tabName, answers };
  if (token) body.submissionToken = token;

  const url = submitUrlBase();
  const startedAt = Date.now();
  const requestCtx = {
    url,
    method: "POST",
    form: formParam,
    tab: tabName,
    answers,
    hasToken: Boolean(token),
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("[submit] network error", {
      ...requestCtx,
      elapsedMs: Date.now() - startedAt,
      error:
        networkErr instanceof Error
          ? { name: networkErr.name, message: networkErr.message, stack: networkErr.stack }
          : networkErr,
    });
    throw networkErr instanceof Error
      ? networkErr
      : new Error("network error");
  }

  const elapsedMs = Date.now() - startedAt;
  const rawText = await res.text().catch(() => "");
  let data: unknown = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (parseErr) {
    console.error("[submit] invalid JSON response", {
      ...requestCtx,
      elapsedMs,
      status: res.status,
      statusText: res.statusText,
      responseText: rawText.slice(0, 2000),
      parseError: parseErr instanceof Error ? parseErr.message : String(parseErr),
    });
    throw new Error(`submit: invalid JSON (${res.status})`);
  }

  const o = (data || {}) as GasErrorPayload & { ok?: boolean };
  const hasError = !res.ok || (o && typeof o === "object" && Boolean(o.error));

  if (hasError) {
    console.error("[submit] failed", {
      ...requestCtx,
      elapsedMs,
      status: res.status,
      statusText: res.statusText,
      responseBody: data,
      responseText: rawText.slice(0, 2000),
    });
    const msg = o.message || o.error || `submit: ${res.status}`;
    throw new Error(msg);
  }

  console.info("[submit] ok", {
    form: formParam,
    tab: tabName,
    elapsedMs,
    status: res.status,
  });
}
