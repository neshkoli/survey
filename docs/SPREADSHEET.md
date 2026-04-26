# Google Sheet layout (MVP)

Use one spreadsheet. The Apps Script can be **bound** to the file (recommended) or use `SPREADSHEET_ID` in Script properties.

## Per-survey tab (one tab = one form)

The **tab name** is what the site passes as `form` after front-end slug resolution (e.g. tab `Survey_Contact` or your chosen name).

### Block 1 — metadata (rows 1–3, columns A–B)

| Column A (key)   | Column B (value)        |
|-------------------|-------------------------|
| `FORM_TITLE`      | Main title (any language) |
| `FORM_SUBTITLE`   | Optional subtitle       |
| `HERO_IMAGE_URL`  | Optional image URL      |

Only these keys are read; extra key rows can be added below for your own notes (they are ignored).

### Block 2 — field definitions (from row 5)

- **Row 5 — headers (exact names):**  
  `fieldId` | `label` | `type` | `required` | `options` | `placeholder` | `helpText`

- **Row 6+ — one field per row**

| fieldId  | label | type     | required | options        | placeholder | helpText |
|----------|-------|----------|----------|----------------|------------|----------|
| fullName | …     | text     | TRUE     |                | …          | …        |
| size     | …     | select   | TRUE     | S,M,L,XL      |            |          |

- **type** (MVP): `text`, `textarea`, `email`, `number`, `select`, `checkbox`, `radio`
- **required**: `TRUE` / `FALSE` (or `true` / `false`)
- **options**: for `select` and `radio`, comma-separated (no need to quote commas in simple cases)

## "Libi" format (3 columns) — `Field` | `Text` | `Type`

Used by the `libi` tab in the [live sheet](https://docs.google.com/spreadsheets/d/1fGwqmm73NGzWmIgx542mFt6tf0jtTaXxxbHa_8FF6lY/):

- **Row 1:** `Field` | `Text` | `Type` (header).
- **Rows 2+:** A = field name (e.g. `Intro`, `Name`, `End`), B = text (intro body, per-field label, or footer), C = type: `Description` (intro text → `subtitle` when A is `Intro`), `Short text` (input), `End` with empty C → `footerText`.
- Responses go to a separate tab: **`libi-responses`**.

The Apps Script in `gas/Code.gs` detects this layout (row1 `Field` + `Text`).

## Responses tab `AllResponses` (standard) or `libi-responses`

**Standard** projects: create a tab named **exactly** `AllResponses` with a header row.

**This project (libi):** tab **`libi-responses`** (configured in `gas/Code.gs`).

Either way, use a header row of:

| A           | B      | C             |
|-------------|--------|---------------|
| `timestamp` | `form` | `payload_json` |

Each successful submit appends one row:

- `timestamp` — ISO-8601 string
- `form` — the survey tab name (e.g. `Survey_Service`)
- `payload_json` — JSON string: `{ "fieldId": "value", ... }`

## Copying a sample

Duplicate an existing form tab, rename the tab, edit metadata and the field table, and keep `AllResponses` as the single shared log for all forms.
