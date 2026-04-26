# סקר (Survey)

אתר סטטי (Vite + Tailwind + [daisyUI](https://daisyui.com/)) לטפסים, ממשק **עברית** (RTL) ו-`?form=` בכתובת. אחסון מול **Google Sheets** דרך **Google Apps Script** (ראו [`gas/`](gas/) ו-[`PLAN.md`](PLAN.md)).

**אתר חי (GitHub Pages):** [https://neshkoli.github.io/survey/](https://neshkoli.github.io/survey/?form=libi) — קוד: [neshkoli/survey](https://github.com/neshkoli/survey).

## פיתוח

```bash
npm install
npm run build   # tsc + vite
npm run dev     # Vite, ברירת מחדל mock בלי GAS
```

- ללא `VITE_GAS_BASE_URL` האתר משתמש **בנתוני mock** (גם build לפרוד, אם המשתנה חסר).
- טופס **ליבי** (הגיליון האמיתי): `?form=libi` — טאב `libi`, תשובות ל-`libi-responses` (רק אחרי פריסת Apps Script / בלי `VITE_USE_MOCK=true`).
- דוגמאות mock נוספות: `?form=shirut`, `?form=contact` — ראו `src/config.ts`.
- לבדיקה מקומית עם mock: קובץ `.env.local` עם `VITE_USE_MOCK=true` (או בלי GAS), ואז `npm run dev` — `http://127.0.0.1:5173/?form=libi`.

### משתני סביבה (`.env` או build)

| משתנה | תיאור |
|--------|--------|
| `VITE_GAS_BASE_URL` | כתובת בסיס Web App (ללא query), למשל `https://script.google.com/macros/s/…/exec` |
| `VITE_USE_MOCK` | `true` / `false` — `false` יחייב GAS; ברירה ב-`npm run dev` היא mock אם אין GAS |
| `VITE_SUBMIT_TOKEN` | (אופציונלי) אם ב-GAS הוגדר `SUBMIT_TOKEN`, חייב להתאים |

## Google Sheets

פריסת הטאב `AllResponses` וטאבי הסקר: [`docs/SPREADSHEET.md`](docs/SPREADSHEET.md).

## Apps Script

התקנת הפרויקט והזרקת ה-ID: [`gas/README.md`](gas/README.md) ו-`gas/Code.gs`.

- **CORS / בדיקה:** לאחר הפריסה, פתחו בדפדפן את `…/exec?action=schema&form=שם_הטאב` (שם הטאב = כפי ב-Google Sheet) וודאו שמתקבל JSON, ואז הטעינה מאתר ה-Pages (או `localhost` אחרי שמירת `VITE_GAS` ב-`.env`).

## GitHub Pages

- Repository → **Settings → Pages** → **GitHub Actions** (מקור הפריסה).
- ה-workflow ב-`.github/workflows/pages.yml` בונה `dist` ומפרסם. הוסיפו **Secrets** (אופציונלי): `VITE_GAS_BASE_URL`, `VITE_SUBMIT_TOKEN` — יוזרקו בזמן `npm run build` ב-CI.

## ביטחון ומגבלות

- Web App "Anyone" או אנונימי מאפשר לכל מי שיש לו את ה-URL לשלוח; `SUBMIT_TOKEN` מקשה מעט על שימוש בזדון.
- לא מיועד ל-PII רגישה ללא בקרה נוספת; ראו [PLAN.md](PLAN.md).

## שלב 2 (עתידי) — עדכון שורה

- לא ממומש בקוד כרגע. כיוון: פרמטרים `token=` / `row=` ב-URL, ו-`submit` ב-GAS בלוגיקה של upsert על `AllResponses` (רשומה + `response_id`).

## קבצים

- `src/api.ts` — `schema` + `submit` מול GAS.
- `src/main.ts` — `?form=`, טעינה, הודעות.
- `src/mock/surveys.ts` — mock בעברית לבד בלי חיבור.
- `PLAN.md` — מפרט הארכיטקטורה (עותק ה-repo, לא ה-plan של Cursor).
