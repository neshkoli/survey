export function getFormParam(): string | null {
  const q = new URLSearchParams(window.location.search);
  const f = q.get("form");
  if (f?.trim()) return f.trim();

  const pathForm = window.location.pathname
    .split("/")
    .map((part) => decodeURIComponent(part).trim())
    .filter(Boolean)[0];

  return pathForm || null;
}

export function getResponsesParam(): string | null {
  const q = new URLSearchParams(window.location.search);
  const responses = q.get("responses");
  if (!responses?.trim()) return null;
  return responses.trim();
}
