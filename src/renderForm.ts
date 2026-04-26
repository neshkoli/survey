import type { FieldDef, SurveySchema, Answers, FieldType } from "./types";

function validateAndCollect(
  schema: SurveySchema,
  root: HTMLElement,
): { ok: true; answers: Answers } | { ok: false; message: string } {
  const answers: Answers = {};

  for (const f of schema.fields) {
    if (f.type === "radio") {
      const checked = root.querySelector<HTMLInputElement>(
        `input[name="radio-${f.fieldId}"]:checked`,
      );
      if (f.required && !checked) {
        return { ok: false, message: `שדה חובה: ${f.label}` };
      }
      if (checked) answers[f.fieldId] = checked.value;
      continue;
    }

    const el = root.querySelector(`[data-field-id="${f.fieldId}"]`);
    if (!el) {
      if (f.required) return { ok: false, message: `שדה חסר: ${f.label}` };
      continue;
    }

    const v = readValue(f, el, root);
    if (f.required && isEmptyValue(f.type, v)) {
      return { ok: false, message: `שדה חובה: ${f.label}` };
    }
    if (v !== undefined) answers[f.fieldId] = v;
  }
  return { ok: true, answers };
}

function isEmptyValue(
  type: FieldType,
  v: string | number | boolean | undefined,
): boolean {
  if (v === undefined) return true;
  if (type === "checkbox") return v === false;
  if (typeof v === "string") return v.trim() === "";
  return false;
}

function readValue(
  f: FieldDef,
  el: Element,
  _root: HTMLElement,
): string | number | boolean | undefined {
  if (f.type === "checkbox" && el instanceof HTMLInputElement) {
    return el.checked;
  }
  if (f.type === "number" && el instanceof HTMLInputElement) {
    if (el.value === "") return undefined;
    const n = el.valueAsNumber;
    return Number.isNaN(n) ? undefined : n;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.value;
  }
  if (el instanceof HTMLSelectElement) {
    if (f.required && el.value === "") return undefined;
    return el.value;
  }
  return undefined;
}

function helpNode(text: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "label-text-alt opacity-70 text-right mt-1";
  d.textContent = text;
  return d;
}

function buildField(f: FieldDef): HTMLElement {
  if (f.type === "checkbox") {
    const row = document.createElement("div");
    row.className = "form-control w-full my-2";
    const inner = document.createElement("label");
    inner.className = "label cursor-pointer justify-start gap-3 flex-row";
    const inp = document.createElement("input");
    inp.type = "checkbox";
    inp.className = "checkbox checkbox-primary";
    inp.setAttribute("data-field-id", f.fieldId);
    const span = document.createElement("span");
    span.className = "label-text";
    span.textContent = f.required ? `${f.label} *` : f.label;
    inner.appendChild(inp);
    inner.appendChild(span);
    row.appendChild(inner);
    if (f.helpText) row.appendChild(helpNode(f.helpText));
    return row;
  }

  if (f.type === "radio" && f.options?.length) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "form-control w-full my-2";
    const leg = document.createElement("legend");
    leg.className = "label-text text-base font-medium mb-2 w-full text-right";
    leg.textContent = f.required ? `${f.label} *` : f.label;
    fieldset.appendChild(leg);
    f.options.forEach((opt, i) => {
      const rlabel = document.createElement("label");
      rlabel.className = "label cursor-pointer justify-start gap-2 flex-row py-0.5";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `radio-${f.fieldId}`;
      input.className = "radio radio-primary";
      input.value = opt;
      if (f.required && i === 0) input.setAttribute("required", "");
      const t = document.createElement("span");
      t.className = "label-text";
      t.textContent = opt;
      rlabel.appendChild(input);
      rlabel.appendChild(t);
      fieldset.appendChild(rlabel);
    });
    if (f.helpText) fieldset.appendChild(helpNode(f.helpText));
    return fieldset;
  }

  const wrap = document.createElement("div");
  wrap.className = "form-control w-full my-2";

  const label = document.createElement("label");
  label.className = "label";
  const title = document.createElement("span");
  title.className = "label-text";
  title.textContent = f.required ? `${f.label} *` : f.label;
  label.appendChild(title);
  wrap.appendChild(label);

  if (f.type === "textarea") {
    const t = document.createElement("textarea");
    t.className = "textarea textarea-bordered w-full min-h-24";
    t.setAttribute("data-field-id", f.fieldId);
    if (f.placeholder) t.placeholder = f.placeholder;
    if (f.required) t.required = true;
    wrap.appendChild(t);
  } else if (f.type === "select" && f.options?.length) {
    const t = document.createElement("select");
    t.className = "select select-bordered w-full";
    t.setAttribute("data-field-id", f.fieldId);
    if (f.required) t.required = true;
    const pl = document.createElement("option");
    pl.value = "";
    pl.textContent = "— בחירה —";
    t.appendChild(pl);
    f.options.forEach((o) => {
      const op = document.createElement("option");
      op.value = o;
      op.textContent = o;
      t.appendChild(op);
    });
    wrap.appendChild(t);
  } else {
    const t = document.createElement("input");
    t.setAttribute("data-field-id", f.fieldId);
    t.className = "input input-bordered w-full";
    if (f.type === "email") t.type = "email";
    else if (f.type === "number") t.type = "number";
    else t.type = "text";
    if (f.placeholder) t.placeholder = f.placeholder;
    if (f.required) t.required = true;
    wrap.appendChild(t);
  }

  if (f.helpText) wrap.appendChild(helpNode(f.helpText));
  return wrap;
}

export function renderSurvey(
  app: HTMLElement,
  schema: SurveySchema,
  onSubmit: (answers: Answers) => void,
  onValidationError: (message: string) => void,
): void {
  app.replaceChildren();
  const outer = document.createElement("div");
  outer.className = "max-w-2xl mx-auto p-4 sm:p-6";
  const wrap = document.createElement("div");
  wrap.className = "survey-card rounded-3xl p-5 sm:p-8 space-y-5";
  if (schema.heroImageUrl) {
    const fig = document.createElement("figure");
    fig.className = "w-full";
    const img = document.createElement("img");
    img.src = schema.heroImageUrl;
    img.alt = schema.title;
    img.className = "w-full max-h-56 object-cover rounded-box";
    fig.appendChild(img);
    wrap.appendChild(fig);
  }
  const head = document.createElement("div");
  head.className = "max-w-none text-center";
  const h1 = document.createElement("h1");
  h1.className =
    "text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center";
  h1.textContent = schema.title;
  head.appendChild(h1);
  if (schema.subtitle) {
    const p = document.createElement("p");
    p.className =
      "opacity-80 whitespace-pre-line text-right leading-relaxed mt-3";
    p.textContent = schema.subtitle;
    head.appendChild(p);
  }
  wrap.appendChild(head);

  const form = document.createElement("form");
  form.className = "space-y-1";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = validateAndCollect(schema, form);
    if (!result.ok) {
      onValidationError(result.message);
      return;
    }
    onSubmit(result.answers);
  });

  for (const f of schema.fields) {
    form.appendChild(buildField(f));
  }

  const row = document.createElement("div");
  row.className = "pt-4 flex justify-center";
  const btn = document.createElement("button");
  btn.type = "submit";
  btn.id = "submit-btn";
  btn.className = "btn btn-primary px-10 min-w-48";
  btn.textContent = "שלח";
  row.appendChild(btn);
  form.appendChild(row);
  wrap.appendChild(form);
  if (schema.footerText) {
    const foot = document.createElement("div");
    foot.className =
      "max-w-none text-center text-base mt-2 whitespace-pre-line text-primary/90 font-medium";
    foot.textContent = schema.footerText;
    wrap.appendChild(foot);
  }
  outer.appendChild(wrap);
  app.appendChild(outer);
}

export function setSubmitLoading(formRoot: HTMLElement, loading: boolean): void {
  const btn = formRoot.querySelector<HTMLButtonElement>("#submit-btn");
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.classList.add("loading", "btn-disabled");
  } else {
    btn.disabled = false;
    btn.classList.remove("loading", "btn-disabled");
  }
}
