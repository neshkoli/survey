import { defineConfig } from "vite";

// In GitHub Actions, GITHUB_REPOSITORY is "owner/repo" — project Pages need /repo/ base.
const base = (() => {
  const r = process.env.GITHUB_REPOSITORY;
  if (r) {
    const name = r.split("/")[1];
    return `/${name}/`;
  }
  return "./";
})();

export default defineConfig({
  base,
});
