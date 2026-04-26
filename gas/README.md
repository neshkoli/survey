# Google Apps Script (backend)

1. In Google Drive, open your spreadsheet (see [`docs/SPREADSHEET.md`](../docs/SPREADSHEET.md)).
2. **Extensions → Apps Script**, delete any boilerplate, paste the contents of [`Code.gs`](Code.gs).
3. In **Project Settings** (gear), not required for a single file, but you can set **Script time zone** to `Asia/Jerusalem` in `appsscript.json` if you use [clasp](https://github.com/google/clasp) to push this folder.
4. **Project → Script properties** (or **File → Project properties** in older UIs) — add:
   - **`SPREADSHEET_ID`**: the ID from the sheet URL (`/d/THIS_PART/edit`). **Required** for a deployed web app; `getActive()` is usually empty when the app runs in the background.  
   For the project sheet: `1fGwqmm73NGzWmIgx542mFt6tf0jtTaXxxbHa_8FF6lY` (tabs `libi` and `libi-responses`).

Responses are appended to the tab **`libi-responses`** (name is set in `Code.gs` `CONFIG.responsesTab`).
5. (Optional) **`SUBMIT_TOKEN`**: if set, clients must send the same value in the JSON field `submissionToken` or in the query string as `?token=`. The Vite app uses `VITE_SUBMIT_TOKEN` in the build.
6. **Deploy → New deployment** → type **Web app**:
   - **Execute as:** Me  
   - **Who has access:** Anyone (for anonymous public surveys)  
7. Copy the **Web app URL** and set it locally as `VITE_GAS_BASE_URL` in `.env` (see root `README`).

**Note:** CORS: test `fetch` to your `script.google.com/.../exec?action=schema&form=YourTab` from the site origin you use (e.g. GitHub Pages) and confirm the browser can read the JSON. If the script returns JSON via `ContentService` with `MimeType.JSON`, this usually works; if not, use Google’s deployment troubleshooting or a thin proxy (see `PLAN.md`).

**Testing in the editor**  
With a bound script, you can set `SPREADSHEET_ID` anyway, or run `doGet` manually with a test `e` object only if the container spreadsheet is the right one. Prefer testing the deployed web URL.
