import "./style.css";
import { fetchSchema, submitAnswers } from "./api";
import { resolveTabName, useMockData } from "./config";
import { getFormParam } from "./query";
import { renderSurvey, setSubmitLoading } from "./renderForm";

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
    <h1 class="text-2xl font-bold">בחרו סקר</h1>
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

function addMockBanner(): void {
  const b = document.createElement("p");
  b.className = "text-center text-xs text-base-content/50 py-1 mb-0";
  b.textContent = "מצב mock: הנתונים מגיעים מ־src/mock/surveys.ts (בלי Google Sheets).";
  app.appendChild(b);
}

async function run(): Promise<void> {
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
  app.replaceChildren();

  if (useMockData()) {
    addMockBanner();
  }

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
