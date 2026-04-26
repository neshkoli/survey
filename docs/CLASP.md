# **clasp** — CLI for Google Apps Script

The official tool is [**@google/clasp**](https://github.com/google/clasp) (install: `npm i` in this repo, then `npx clasp`).

`gcloud` is **not** for Apps Script.

## One-time: enable API + log in

1. Open [script.google.com/home/usersettings](https://script.google.com/home/usersettings) → turn **Google Apps Script API** **On**.  
   If you skip this, `gas:push` fails with: *User has not enabled the Apps Script API* (HTTP 403). After turning it on, wait 1–2 minutes and retry.
2. In the project root:
   ```bash
   npm install
   npm run gas:login
   ```
   Complete the browser OAuth flow (your Google account that owns the script / sheet).

## Link this repo to your existing script (recommended)

1. In [Apps Script](https://script.google.com): open the project you already deployed as a Web app.
2. **Project Settings** (left gear) → copy **Script ID** (a long id like `1xYz...` — this is **not** the `AKfycb...` deployment id from the Web App URL).
3. At the repo root:
   ```bash
   cp .clasp.json.example .clasp.json
   ```
   Edit `.clasp.json` and set `scriptId` to that value. Keep `rootDir` as `gas` (points at [`gas/`](../gas/) for `Code.gs` + `appsscript.json`).

4. If the remote script already has code, pull first (optional, may overwrite):
   ```bash
   npm run gas:pull
   ```
5. Push local code:
   ```bash
   npm run gas:push
   ```

## Deploy: new version on the **same** Web App URL

Your public `/exec` URL is tied to a **deployment** id (`AKfycb...` in the URL). After `gas:push`, publish that version to that deployment:

```bash
npm run gas:deploy
```

This runs `clasp deploy -i <deploymentId> -d ...` so the **same** Web App URL keeps working; Google rolls it to the new version.

(If the command ever fails, in the Apps Script UI: **Deploy → Manage deployments** → your Web app → **Edit** (pencil) → **New version** → **Deploy**.)

## Scripts (see [package.json](../package.json))

| Command | What it does |
|--------|----------------|
| `npm run gas:login` / `gas:logout` | OAuth for clasp |
| `npm run gas:open` | Opens the project in the browser |
| `npm run gas:pull` | Download remote project into `gas/` |
| `npm run gas:push` | Upload `gas/Code.gs` and `gas/appsscript.json` to Google |
| `npm run gas:deploy` | New version + attach to the existing Web App deployment (id in `package.json`) |
| `npm run gas:deployments` | List deployments |

## Manifest fields we set

[`gas/appsscript.json`](../gas/appsscript.json) includes:

- `timeZone`: `Asia/Jerusalem`
- `exceptionLogging`: `STACKDRIVER`
- `runtimeVersion`: `V8`
- `oauthScopes`: `https://www.googleapis.com/auth/spreadsheets` (read/write the spreadsheet used by the script)

If Google asks for re-authorization after a scope change, run the **Deploy** flow once from the UI and approve the prompt.

## New project instead of existing

```bash
npm run gas:login
cd gas
npx clasp create --type standalone --title "survey-backend"
# Then copy the printed scriptId into a new .clasp.json with rootDir gas, or move .clasp.json to repo root and set rootDir.
```

For a **container-bound** script (if you use `clasp create --type sheets` etc.), use Google’s [clasp docs](https://developers.google.com/apps-script/guides/clasp).

**Do not commit** `.clasp.json` (contains `scriptId`); the example file is [`.clasp.json.example`](../.clasp.json.example).
