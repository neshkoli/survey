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
- ה-workflow ב-`.github/workflows/pages.yml` בונה `dist` ומפרסם. **חובה לשמירה בגיליון:** `VITE_GAS_BASE_URL` = כתובת ה־Web App (ב־**Repository secrets**). בלי secret זה, ה-build נטען במצב הדמיה ו־**לא נרשמות שורות** ב־`libi-responses`.  
  אופציונלי: `VITE_SUBMIT_TOKEN` אם ב־GAS הוגדר `SUBMIT_TOKEN`.

#### לא מופיעות תוצאות ב־Google Sheet?

1. ב־[Actions](https://github.com/neshkoli/survey/actions) ודאו שהפריסה האחרונה **אחרי** הוספת ה-secret הצליחה.  
2. **Secrets → Actions → `VITE_GAS_BASE_URL`**: `https://script.google.com/macros/s/.../exec` (מפריסת Apps Script). **אל** תשימו `?` בסוף.  
3. ב-Apps Script: `SPREADSHEET_ID` של [הגיליון](https://docs.google.com/spreadsheets/d/1fGwqmm73NGzWmIgx542mFt6tf0jtTaXxxbHa_8FF6lY/edit), Web App "Anyone" / Execute as you.  
4. בדפדפן (F12) — אם אחרי שליחה מופיע `[submit] NOT saved to Google Sheets`, האתר עדיין **לא** משתמש ב־GAS.  
5. בקונסול, אם יש שגיאה אדומה `[submit] failed` — בדקו את `message` (אימות, `SUBMIT_TOKEN`, CORS, וכו׳).

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
