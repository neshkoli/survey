# Fix `[submit] DRY-RUN` (nothing saved to Google Sheets)

That message means the **static site was built without** `VITE_GAS_BASE_URL` inside the JavaScript bundle. The URL must be available **at build time** (GitHub Actions for Pages, or `.env` locally).

**`gcloud` does not deploy Google Apps Script.** Use the **Apps Script** editor (or [`clasp`](https://github.com/google/clasp)), then paste the **Web app URL** into GitHub as a secret.

## 1. Deploy the script and copy the Web app URL

1. Open your spreadsheet → **Extensions → Apps Script**.
2. Paste the code from [`../gas/Code.gs`](../gas/Code.gs) (or use **clasp** to push the `gas/` folder after `clasp login` & `clasp create` / `clasp clone`).
3. **Project Settings** (gear) → **Script properties**:
   - `SPREADSHEET_ID` = `1fGwqmm73NGzWmIgx542mFt6tf0jtTaXxxbHa_8FF6lY` (or your sheet ID).
4. **Deploy** → **New deployment** → type **Web app**:
   - **Execute as:** Me  
   - **Who has access:** **Anyone** (or “Anyone with the link” — must allow the public form to POST).
5. **Copy the Web app URL**. It must look like:
   ```text
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   - No `?` at the end in the secret.
   - This same value is `VITE_GAS_BASE_URL`.

6. Quick test in the browser (replace `YOUR_ID` and tab name):
   ```text
   https://script.google.com/macros/s/YOUR_ID/exec?action=schema&form=libi
   ```
   You should see JSON (or an error message in JSON), not a login page.

## 2. Add the secret on GitHub (so the *live site* gets the URL)

With [GitHub CLI](https://cli.github.com/) (`gh`):

```bash
gh auth login   # if needed

# Paste YOUR real /exec URL between the quotes:
gh secret set VITE_GAS_BASE_URL --body "https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec" -R neshkoli/survey
```

Or in the **GitHub UI**: repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → Name: `VITE_GAS_BASE_URL` → value = the `/exec` URL.

## 3. Rebuild the site (required)

The secret is only applied when `npm run build` runs. Trigger a new deploy:

- **Actions** → **Deploy to GitHub Pages** → **Run workflow**, or  
- push any commit, or  
- from your laptop:

  ```bash
  cd /path/to/survey
  git commit --allow-empty -m "chore: trigger Pages rebuild for VITE_GAS_BASE_URL"
  git push origin main
  ```

Wait until the workflow is green, then open the site with a **hard refresh** (or incognito) so the new JS loads.

## 4. (Optional) Local testing with the same URL

In the project root, create **`.env`** (or **`.env.local`**, not committed):

```env
VITE_GAS_BASE_URL=https://script.google.com/macros/s/XXXXXXXX/XXXXXXXX/exec
VITE_USE_MOCK=false
```

```bash
npm run dev
# open http://localhost:5173/?form=libi
```

Open DevTools → on submit you should see **`[submit] ok`**, not DRY-RUN, and a new row in **`libi-responses`**.

## 5. Optional: `SUBMIT_TOKEN`

If you set the script property **`SUBMIT_TOKEN`**, add a matching **Actions** secret **`VITE_SUBMIT_TOKEN`**, then rebuild again.

## Checklist

| Step | Done? |
|------|--------|
| `SPREADSHEET_ID` in Apps Script | ☐ |
| Web app deployed, “Anyone” | ☐ |
| `VITE_GAS_BASE_URL` in GitHub Actions secrets | ☐ |
| New **Deploy to GitHub Pages** run after adding secret | ☐ |
| Test `…/exec?action=schema&form=libi` in browser | ☐ |

After this, the yellow “לא נשמר בגיליון” banner should **disappear** on the live site, and rows should appear in the sheet.
