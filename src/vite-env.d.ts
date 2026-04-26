/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAS_BASE_URL: string;
  /** "true" to force mock API (or use in dev) */
  readonly VITE_USE_MOCK: string;
  /** Optional: must match Apps Script property SUBMIT_TOKEN if set */
  readonly VITE_SUBMIT_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
