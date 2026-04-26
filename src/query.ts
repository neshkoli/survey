export function getFormParam(): string | null {
  const q = new URLSearchParams(window.location.search);
  const f = q.get("form");
  if (!f?.trim()) return null;
  return f.trim();
}
