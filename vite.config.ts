import { defineConfig } from "vite";

// Custom-domain Pages are served from the domain root; project Pages need /repo/.
const base = (() => {
  if (process.env.GITHUB_PAGES_CUSTOM_DOMAIN) {
    return "/";
  }
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
