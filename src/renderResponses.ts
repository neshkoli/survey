import type { Answers, ResponsesPayload } from "./types";

function formatValue(v: Answers[string] | undefined): string {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "boolean") return v ? "כן" : "לא";
  return String(v);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function cell(text: string, tag: "td" | "th" = "td"): HTMLTableCellElement {
  const el = document.createElement(tag);
  el.className = tag === "th" ? "px-3 py-2 text-right font-semibold" : "px-3 py-2 align-top";
  el.textContent = text;
  return el;
}

export function renderResponses(app: HTMLElement, payload: ResponsesPayload): void {
  app.replaceChildren();
  const outer = document.createElement("div");
  outer.className = "max-w-6xl mx-auto p-4 sm:p-6";

  const card = document.createElement("div");
  card.className = "survey-card rounded-3xl p-5 sm:p-8 space-y-5";

  const header = document.createElement("div");
  header.className = "text-center space-y-2";
  const title = document.createElement("h1");
  title.className = "text-3xl sm:text-4xl font-bold tracking-tight text-primary";
  title.textContent = `תגובות: ${payload.title}`;
  const count = document.createElement("p");
  count.className = "text-sm text-base-content/60";
  count.textContent = `${payload.rows.length} תגובות`;
  header.appendChild(title);
  header.appendChild(count);
  card.appendChild(header);

  if (!payload.rows.length) {
    const empty = document.createElement("div");
    empty.className = "alert text-right";
    empty.textContent = "עדיין אין תגובות להצגה.";
    card.appendChild(empty);
    outer.appendChild(card);
    app.appendChild(outer);
    return;
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "overflow-x-auto rounded-2xl border border-base-300 bg-base-100";
  const table = document.createElement("table");
  table.className = "table table-zebra w-full text-right";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.appendChild(cell("זמן שליחה", "th"));
  for (const f of payload.fields) {
    headRow.appendChild(cell(f.label || f.fieldId, "th"));
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of payload.rows) {
    const tr = document.createElement("tr");
    tr.appendChild(cell(formatTimestamp(row.timestamp)));
    for (const f of payload.fields) {
      tr.appendChild(cell(formatValue(row.answers[f.fieldId])));
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  card.appendChild(tableWrap);

  outer.appendChild(card);
  app.appendChild(outer);
}
