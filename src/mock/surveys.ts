import type { SurveySchema } from "../types";

/**
 * מידע לדוגמה — תואם למבנה שיוחזר מ-Apps Script (action=schema).
 * מפתחות: שם טאב בגיליון (או slug אחרי resolveTabName).
 */
export const MOCK_SCHEMAS: Record<string, SurveySchema> = {
  /** Survey_Service — shirut */
  Survey_Service: {
    form: "Survey_Service",
    title: "איך הייתה החוויה שלכם אצלנו?",
    subtitle: "המשוב שלכם עוזר לנו להשתפר. בערך דקה למלא.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    fields: [
      {
        fieldId: "fullName",
        label: "שם מלא",
        type: "text",
        required: true,
        placeholder: "יוסי כהן",
        helpText: "ישמש לפנייה בלבד אם נבקש הבהרה",
      },
      {
        fieldId: "satisfaction",
        label: "רמת שביעות רצון",
        type: "select",
        required: true,
        options: ["מצוין", "טוב", "בינוני", "גרוע"],
        helpText: "בחרו אפשרות אחת",
      },
      {
        fieldId: "wouldRecommend",
        label: "הייתי ממליץ/ה לחבר/ה",
        type: "checkbox",
        required: false,
        helpText: "סמנו אם מדובר בהמלצה אמיתית",
      },
      {
        fieldId: "details",
        label: "הערות נוספות",
        type: "textarea",
        required: false,
        placeholder: "מה עבד טוב? מה אפשר לשפר?",
      },
    ],
  },

  /** Survey_Contact — contact */
  Survey_Contact: {
    form: "Survey_Contact",
    title: "יצירת קשר",
    subtitle: "נשמח לשמוע מכם — נענה תוך יומיים עבודה.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80",
    fields: [
      {
        fieldId: "email",
        label: "אימייל",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        fieldId: "topic",
        label: "נושא הפנייה",
        type: "radio",
        required: true,
        options: ["מוצר", "תמיכה", "ניהול חשבון", "אחר"],
      },
      {
        fieldId: "phone",
        label: "טלפון (רשות)",
        type: "text",
        required: false,
        placeholder: "050-0000000",
      },
      {
        fieldId: "message",
        label: "הודעה",
        type: "textarea",
        required: true,
        placeholder: "תארו בקצרה את בקשתכם",
      },
    ],
  },

  /** Tab "libi" — מבנה 3 עמודות (Field, Text, Type) כמו בגיליון אמיתי */
  libi: {
    form: "libi",
    title: "מסלול לִבִּי — אמית רננים",
    subtitle: `בשנת הלימודים תשפ"ז נפתח באמית רננים מסלול לבנות שרוצות יותר!
• תוספת שעות קודש
• לימוד ברמה גבוהה ובהעמקה
• מפגשי שיא ושבתות
• חברותא וחבורה בבית המדרש
ההשתתפות בתכנית בעלות תוספתית. רישום סופי ייעשה בהמשך בסמוך לתחילת השנה. מוזמנות למפגש גיבוש למתעניינות במסלול לִבִּי. המפגש יתקיים ביום שני, בתאריך ט' בסיון 25.5, בשעה 8:15 בבית המדרש באמית רננים.
בתכנית: תפילה מוזיקלית, ארוחת בוקר מפנקת, לימוד בחבורה. ההגעה עצמאית, החזרה בהסעה מאמית רננים לבתי הספר. ההשתתפות בהרשמה מראש:`,
    footerText: "בואו בשמחה! מחכות לראותכן 🙂",
    fields: [
      {
        fieldId: "Name",
        label: "שם התלמידה",
        type: "text",
        required: true,
      },
      {
        fieldId: "Parent",
        label: "שם ההורה",
        type: "text",
        required: true,
      },
      {
        fieldId: "Phone",
        label: "טלפון",
        type: "text",
        required: true,
      },
      {
        fieldId: "Remark",
        label: "משהו חשוב לנו שיהיה במסלול הזה",
        type: "textarea",
        required: false,
      },
    ],
  },
};

export function getMockSchema(tabName: string): SurveySchema | undefined {
  return MOCK_SCHEMAS[tabName];
}
