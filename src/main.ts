import "./style.css";
import { fetchResponses, fetchSchema, submitAnswers } from "./api";
import { isLiveToSheets, resolveTabName } from "./config";
import { getFormParam, getResponsesParam } from "./query";
import { renderSurvey, setSubmitLoading } from "./renderForm";
import { renderResponses } from "./renderResponses";

const appEl = document.getElementById("app");
if (!appEl) throw new Error("missing #app");
const app: HTMLElement = appEl;

if (!document.documentElement.getAttribute("data-theme")) {
  document.documentElement.setAttribute("data-theme", "cream");
}

function showError(message: string): void {
  app.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "p-4 max-w-2xl mx-auto";
  const a = document.createElement("div");
  a.setAttribute("role", "alert");
  a.className = "alert alert-error text-right";
  const span = document.createElement("span");
  span.textContent = message;
  a.appendChild(span);
  wrap.appendChild(a);
  app.appendChild(wrap);
}

function showNoFormState(): void {
  app.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "p-4 max-w-2xl mx-auto space-y-3 text-right";
  wrap.innerHTML = `
    <h1 class="text-2xl font-bold">בחרו שאלון</h1>
    <p class="opacity-80">הוסיפו לכתובת את פרמטר <code class="px-1 bg-base-300 rounded">?form=</code> — לדוגמה:</p>
    <ul class="list-disc list-inside space-y-1 text-sm">
      <li><a class="link link-primary" href="?form=libi">?form=libi</a> — מסלול לִבִּי (טאב <span dir="ltr">libi</span> בגיליון; תשובות ל-<span dir="ltr">libi-responses</span>)</li>
      <li><a class="link link-primary" href="?form=shirut">?form=shirut</a> — דוגמה mock (<span dir="ltr">Survey_Service</span>)</li>
      <li><a class="link link-primary" href="?form=contact">?form=contact</a> — דוגמה mock (<span dir="ltr">Survey_Contact</span>)</li>
    </ul>
  `;
  app.appendChild(wrap);
}

function showSuccess(): void {
  app.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "p-4 max-w-2xl mx-auto";
  const a = document.createElement("div");
  a.setAttribute("role", "alert");
  a.className = "alert alert-success text-right";
  const span = document.createElement("span");
  span.textContent = "התשובה נשלחה. תודה רבה!";
  a.appendChild(span);
  wrap.appendChild(a);
  app.appendChild(wrap);
}

function showToastError(message: string): void {
  const wrap = document.createElement("div");
  wrap.className = "toast toast-top toast-center z-50";
  const t = document.createElement("div");
  t.setAttribute("role", "alert");
  t.className = "alert alert-error text-right";
  const span = document.createElement("span");
  span.textContent = message;
  t.appendChild(span);
  wrap.appendChild(t);
  app.appendChild(wrap);
  setTimeout(() => wrap.remove(), 5000);
}

function showResponsesPasswordForm(
  onSubmit: (password: string) => void,
  error?: string,
): void {
  app.replaceChildren();
  const outer = document.createElement("div");
  outer.className = "max-w-md mx-auto p-4 sm:p-6";
  const form = document.createElement("form");
  form.className = "survey-card rounded-3xl p-5 sm:p-8 space-y-4 text-right";
  form.innerHTML = `
    <h1 class="text-2xl font-bold text-primary text-center">צפייה בתגובות</h1>
    <p class="text-sm text-base-content/70 text-center">הכניסו סיסמה כדי להציג את טבלת התגובות.</p>
    <label class="form-control w-full">
      <span class="label-text mb-1">סיסמה</span>
      <input id="responses-password" class="input input-bordered w-full" type="password" autocomplete="current-password" autofocus />
    </label>
    <button class="btn btn-primary w-full" type="submit">הצג תגובות</button>
  `;
  if (error) {
    const alert = document.createElement("div");
    alert.setAttribute("role", "alert");
    alert.className = "alert alert-error text-sm";
    alert.textContent = error;
    form.insertBefore(alert, form.querySelector("label"));
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector<HTMLInputElement>("#responses-password");
    onSubmit(input?.value.trim() || "");
  });
  outer.appendChild(form);
  app.appendChild(outer);
}

/** Shown when submissions do not go to Google Sheets. */
function addDataSourceBanner(): void {
  if (isLiveToSheets()) {
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "max-w-2xl mx-auto w-full px-2 sm:px-4";
  if (import.meta.env.PROD) {
    const a = document.createElement("div");
    a.setAttribute("role", "status");
    a.className = "alert alert-warning text-right text-sm shadow-sm";
    a.innerHTML =
      "<span><strong>הנתונים לא נשמרים ב־Google Sheets</strong> — האתר נבנה בלי <span dir=\"ltr\">VITE_GAS_BASE_URL</span> או עם מצב הדמיה. " +
      "כדי לראות שורות בטאב <span dir=\"ltr\">libi-responses</span>: (1) פרסו Apps Script, הגדירו <span dir=\"ltr\">SPREADSHEET_ID</span> בפרויקט, " +
      "(2) ב־GitHub: Settings → Secrets and variables → Actions — הוסיפו secret בשם <span dir=\"ltr\">VITE_GAS_BASE_URL</span> עם כתובת ה־Web App המלאה, " +
      "(3) היריץו שוב את ה־workflow <strong>Deploy to GitHub Pages</strong> (או דחפו commit). " +
      "אחרי שליחה, בקונסול (F12) — אם מופיע <code dir=\"ltr\" class=\"px-1 bg-base-300 rounded\">[submit] NOT saved</code>, השורה לא הוכנסה לגיליון.</span>";
    wrap.appendChild(a);
  } else {
    const p = document.createElement("p");
    p.className = "text-center text-xs text-base-content/50 py-1";
    p.textContent =
      "מצב מקומי: נתוני mock / בלי GAS — שליחה לא נרשמת בגיליון עד ש־VITE_GAS_BASE_URL מוגדר ב־.env.";
  }
  app.appendChild(wrap);
}

async function run(): Promise<void> {
  const responsesParam = getResponsesParam();
  if (responsesParam) {
    const loadResponses = async (password: string): Promise<void> => {
      if (!password) {
        showResponsesPasswordForm(loadResponses, "יש להזין סיסמה.");
        return;
      }

      const loading = document.createElement("div");
      app.replaceChildren();
      loading.className = "p-8 text-center";
      loading.innerHTML =
        '<span class="loading loading-spinner loading-lg" aria-label="טוען"></span><p class="mt-2 opacity-80">טוען תגובות…</p>';
      app.appendChild(loading);

      try {
        const responses = await fetchResponses(responsesParam, password);
        document.title = `תגובות: ${responses.title}`;
        renderResponses(app, responses);
      } catch (e) {
        showResponsesPasswordForm(
          loadResponses,
          e instanceof Error ? e.message : "שגיאה בטעינת התגובות",
        );
      }
    };

    showResponsesPasswordForm(loadResponses);
    return;
  }

  const formParam = getFormParam();
  if (!formParam) {
    showNoFormState();
    return;
  }

  const tabName = resolveTabName(formParam);
  const loading = document.createElement("div");
  loading.className = "p-8 text-center";
  loading.innerHTML =
    '<span class="loading loading-spinner loading-lg" aria-label="טוען"></span><p class="mt-2 opacity-80">טוען…</p>';
  app.appendChild(loading);

  let schema;
  try {
    schema = await fetchSchema(formParam);
  } catch (e) {
    showError(e instanceof Error ? e.message : "שגיאה בטעינת הטופס");
    return;
  }
  document.title = schema.title;
  app.replaceChildren();

  addDataSourceBanner();

  renderSurvey(
    app,
    schema,
    async (answers) => {
      setSubmitLoading(app, true);
      try {
        await submitAnswers(formParam, tabName, answers);
        showSuccess();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "שליחה נכשלה";
        showToastError(msg);
      } finally {
        setSubmitLoading(app, false);
      }
    },
    (message) => showToastError(message),
  );
}

run().catch((e) => {
  console.error(e);
  showError(e instanceof Error ? e.message : "שגיאה לא ידועה");
});
