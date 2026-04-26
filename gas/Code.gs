/**
 * Survey backend — Web app: action=schema (GET), action=submit (POST JSON).
 * Bind this project to the spreadsheet, or set script property SPREADSHEET_ID.
 * Optional: SUBMIT_TOKEN — send the same value as JSON `submissionToken` or query `?token=`.
 */
var CONFIG = {
  metaKeys: { title: "FORM_TITLE", subtitle: "FORM_SUBTITLE", hero: "HERO_IMAGE_URL" },
  metadataRows: { start: 1, end: 20, keyCol: 1, valueCol: 2 },
  fieldHeaderRow: 5,
  fieldDataStartRow: 6,
  fieldHeaders: ["fieldid", "label", "type", "required", "options", "placeholder", "helptext"],
  responsesTab: "libi-responses",
  responseHeaders: ["timestamp", "form", "payload_json"],
};

/**
 * @param {GoogleAppsScript.Events.DoGet} e
 */
function doGet(e) {
  return handleRequest_("GET", e && e.parameter ? e.parameter : {}, null);
}

/**
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  var body = null;
  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return jsonOut_({ error: "invalid_json", message: String(err) }, 400);
  }
  return handleRequest_("POST", e && e.parameter ? e.parameter : {}, body);
}

function handleRequest_(method, query, body) {
  var action = (query && query.action) || (body && body.action);
  if (method === "GET" && action === "schema") {
    return schema_(String(query.form || "").trim());
  }
  if (method === "POST" && (action === "submit" || (body && body.form && body.answers != null))) {
    if (!body || !body.form) {
      return jsonOut_({ error: "bad_request", message: "form and answers required" }, 400);
    }
    return submit_(String(body.form).trim(), body.answers || {}, body, query);
  }
  return jsonOut_({ error: "not_found", message: "unknown action" }, 404);
}

function schema_(form) {
  if (!form) {
    return jsonOut_({ error: "bad_request", message: "form parameter required" }, 400);
  }
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(form);
  if (!sh) {
    return jsonOut_({ error: "not_found", message: "form tab not found" }, 404);
  }
  var def = getFormDefinition_(sh);
  if (!def.fields || !def.fields.length) {
    return jsonOut_({ error: "config_error", message: "no fields in sheet" }, 500);
  }
  var out = { form: form, title: def.title || "Survey", fields: def.fields };
  if (def.subtitle) {
    out.subtitle = def.subtitle;
  }
  if (def.hero) {
    out.heroImageUrl = def.hero;
  }
  if (def.footer) {
    out.footerText = def.footer;
  }
  return jsonOut_(out, 200);
}

function submit_(form, answers, body, query) {
  var err = requireTokenIfSet_(body, query);
  if (err) return err;

  if (!form) {
    return jsonOut_({ error: "bad_request", message: "form required" }, 400);
  }
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(form);
  if (!sh) {
    return jsonOut_({ error: "not_found", message: "form tab not found" }, 404);
  }
  var def2 = getFormDefinition_(sh);
  var fieldDefs = def2.fields;
  if (!fieldDefs || !fieldDefs.length) {
    return jsonOut_({ error: "config_error", message: "no fields in sheet" }, 500);
  }
  var norm = ensurePlainObject_(answers);
  var valid = validateAnswers_(fieldDefs, norm);
  if (valid !== true) {
    return jsonOut_({ error: "validation", message: valid }, 400);
  }

  var respSh = getOrCreateResponses_(ss);
  var ts = new Date().toISOString();
  var row = [ts, form, JSON.stringify(norm)];
  respSh.appendRow(row);
  return jsonOut_({ ok: true }, 200);
}

function requireTokenIfSet_(body, query) {
  var token = PropertiesService.getScriptProperties().getProperty("SUBMIT_TOKEN");
  if (!token) {
    return null;
  }
  var got = (body && body.submissionToken) || (query && query.token) || "";
  if (String(got) === String(token)) {
    return null;
  }
  return jsonOut_({ error: "forbidden", message: "invalid or missing token" }, 403);
}

function getSpreadsheet_() {
  // Web app deployments are not "bound" in practice — use SPREADSHEET_ID.
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }
  throw new Error("Set script property SPREADSHEET_ID (from the sheet URL) or test from the bound project editor");
}

/**
 * @returns {{ title: string, subtitle: string, hero: string, fields: Object[], footer: string }}
 */
function getFormDefinition_(sh) {
  if (isLibiThreeCol_(sh)) {
    return readLibiThreeCol_(sh);
  }
  var meta = readMetadata_(sh);
  var fields = readFields_(sh);
  return {
    title: meta.title || "Survey",
    subtitle: meta.subtitle || "",
    hero: meta.hero || "",
    fields: fields,
    footer: "",
  };
}

/** Row1: Field | Text | Type (e.g. "libi" tab) */
function isLibiThreeCol_(sh) {
  var a1 = String(sh.getRange(1, 1).getValue() || "")
    .trim()
    .toLowerCase();
  var b1 = String(sh.getRange(1, 2).getValue() || "")
    .trim()
    .toLowerCase();
  return a1 === "field" && b1 === "text";
}

/**
 * @returns {{ title: string, subtitle: string, hero: string, fields: Object[], footer: string }}
 */
function readLibiThreeCol_(sh) {
  var title = "מסלול לִבִּי — אמית רננים";
  var subtitle = "";
  var hero = "";
  var footer = "";
  var fields = [];
  var last = sh.getLastRow();
  var r;
  for (r = 2; r <= last; r++) {
    var field = String(sh.getRange(r, 1).getValue() || "").trim();
    var textB = sh.getRange(r, 2).getValue();
    var text = textB != null ? String(textB) : "";
    var tRaw = sh.getRange(r, 3).getValue();
    var t = String(tRaw != null ? tRaw : "")
      .trim()
      .toLowerCase();
    if (!field && !text && !t) {
      continue;
    }
    var fLower = field.toLowerCase();
    if (isHeroImageRow_(fLower, t)) {
      if (text.trim()) {
        hero = normalizeImageUrl_(text.trim());
      }
      continue;
    }
    if (fLower === "title" && t.indexOf("short") >= 0) {
      if (text.trim()) {
        title = text.trim();
      }
      continue;
    }
    if (fLower === "end" && (!t || t === "footer" || t === "סיום")) {
      footer = text;
      continue;
    }
    if (fLower === "intro" && (t === "description" || t === "תיאור")) {
      subtitle = text;
      continue;
    }
    if (t === "description" || t === "תיאור") {
      continue;
    }
    if (t === "short text" || t === "short_text" || t === "long text" || t === "long_text" || t.indexOf("short") === 0) {
      var fid = fieldIdFromLibiField_(field, r);
      var isRemark = fLower === "remark" || fLower === "הערה" || fLower === "הערות";
      var isLong = t === "long text" || t === "long_text" || isRemark;
      fields.push({
        fieldId: fid,
        label: text,
        type: isLong ? "textarea" : "text",
        required: !isRemark,
      });
    }
  }
  return { title: title, subtitle: subtitle, hero: hero, fields: fields, footer: footer };
}

function isHeroImageRow_(fieldName, typeName) {
  return (
    fieldName === "image" ||
    fieldName === "hero" ||
    fieldName === "heroimage" ||
    fieldName === "hero_image" ||
    fieldName === "headerimage" ||
    fieldName === "header_image" ||
    fieldName === "תמונה" ||
    typeName === "image" ||
    typeName === "תמונה"
  );
}

function normalizeImageUrl_(url) {
  var s = String(url || "").trim();
  var idMatch =
    s.match(/\/file\/d\/([A-Za-z0-9_-]+)/) ||
    s.match(/[?&]id=([A-Za-z0-9_-]+)/) ||
    s.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (idMatch && s.indexOf("drive.google.com") >= 0) {
    return "https://drive.google.com/thumbnail?id=" + idMatch[1] + "&sz=w1600";
  }
  return s;
}

function fieldIdFromLibiField_(field, rowNum) {
  var s = String(field || "").replace(/^\s+|\s+$/g, "");
  if (s && /^[A-Za-z]/.test(s) && !/\s/.test(s)) {
    return s;
  }
  if (s) {
    return s.replace(/[^A-Za-z0-9_]/g, "_") + "_" + rowNum;
  }
  return "field_" + rowNum;
}

function readMetadata_(sh) {
  var start = CONFIG.metadataRows.start;
  var end = CONFIG.metadataRows.end;
  var kc = CONFIG.metadataRows.keyCol;
  var vc = CONFIG.metadataRows.valueCol;
  var res = { title: "", subtitle: "", hero: "" };
  for (var r = start; r <= end; r++) {
    var k = String(sh.getRange(r, kc).getValue() || "").trim();
    var v = sh.getRange(r, vc).getValue();
    var s = v != null ? String(v) : "";
    if (k === CONFIG.metaKeys.title) res.title = s;
    else if (k === CONFIG.metaKeys.subtitle) res.subtitle = s;
    else if (k === CONFIG.metaKeys.hero) res.hero = s;
  }
  return res;
}

function readFields_(sh) {
  var hRow = CONFIG.fieldHeaderRow;
  var start = CONFIG.fieldDataStartRow;
  var last = sh.getLastRow();
  if (last < start) return [];
  var range = sh.getRange(hRow, 1, last, 7);
  var values = range.getValues();
  var header = values[0].map(function (c) {
    return String(c || "")
      .trim()
      .toLowerCase();
  });
  var idx = {};
  CONFIG.fieldHeaders.forEach(function (name) {
    var p = header.indexOf(name);
    if (p >= 0) {
      idx[name] = p;
    }
  });
  if (idx["fieldid"] == null) {
    idx["fieldid"] = 0;
  }
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var id = String((row[idx["fieldid"]] != null ? row[idx["fieldid"]] : row[0]) || "")
      .trim();
    if (!id) break;
    var cType = idx["type"] != null ? idx["type"] : 2;
    var cReq = idx["required"] != null ? idx["required"] : 3;
    var cLabel = idx["label"] != null ? idx["label"] : 1;
    var type = String(row[cType] || "text")
      .trim()
      .toLowerCase();
    var req = toBool_(row[cReq]);
    var rec = { fieldId: id, label: str_(row, idx, "label", cLabel), type: normalizeType_(type), required: req };
    var opt = str_(row, idx, "options", 4);
    if (opt) {
      rec.options = opt
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return s;
        });
    }
    var ph = str_(row, idx, "placeholder", 5);
    if (ph) rec.placeholder = ph;
    var ht = str_(row, idx, "helptext", 6);
    if (ht) rec.helpText = ht;
    out.push(rec);
  }
  return out;
}

function str_(row, idx, key, defCol) {
  var c = idx[key] != null && idx[key] >= 0 ? idx[key] : defCol;
  var v = row[c];
  if (v == null) return "";
  return String(v);
}

function normalizeType_(t) {
  if (t === "email" || t === "text" || t === "textarea" || t === "number" || t === "select" || t === "checkbox" || t === "radio") {
    return t;
  }
  if (t === "description" || t === "תיאור") {
    return "text";
  }
  if (t === "short text" || t === "short_text" || t === "long text" || t === "long_text") {
    return t === "long text" || t === "long_text" ? "textarea" : "text";
  }
  if (t && t.indexOf("short") === 0) {
    return "text";
  }
  return "text";
}

function toBool_(v) {
  if (v === true) return true;
  if (v === false) return false;
  var s = String(v)
    .trim()
    .toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "כן" || s === "on";
}

function getOrCreateResponses_(ss) {
  var name = CONFIG.responsesTab;
  var sh = ss.getSheetByName(name);
  if (sh) {
    return sh;
  }
  sh = ss.insertSheet(name);
  sh.appendRow(CONFIG.responseHeaders);
  return sh;
}

function ensurePlainObject_(answers) {
  if (answers == null) return {};
  if (Object.prototype.toString.call(answers) === "[object Object]") {
    return answers;
  }
  return {};
}

function validateAnswers_(fields, answers) {
  var byId = {};
  fields.forEach(function (f) {
    byId[f.fieldId] = f;
  });
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var v = answers[f.fieldId];
    if (f.required) {
      if (f.type === "checkbox") {
        if (v !== true) {
          return "required field: " + f.fieldId;
        }
      } else if (f.type === "radio" || f.type === "select") {
        if (v == null || (typeof v === "string" && !String(v).trim())) {
          return "required field: " + f.fieldId;
        }
      } else {
        if (v == null || (typeof v === "string" && !String(v).trim())) {
          return "required field: " + f.fieldId;
        }
      }
    }
  }
  for (var j = 0; j < fields.length; j++) {
    var ff = fields[j];
    var vv = answers[ff.fieldId];
    if (ff.type === "select" && ff.options && ff.options.length) {
      if (vv != null && String(vv) !== "" && ff.options.indexOf(String(vv)) < 0) {
        return "invalid option for " + ff.fieldId;
      }
    }
    if (ff.type === "radio" && ff.options && ff.options.length) {
      if (vv != null && String(vv) !== "" && ff.options.indexOf(String(vv)) < 0) {
        return "invalid option for " + ff.fieldId;
      }
    }
  }
  for (var k in answers) {
    if (Object.prototype.hasOwnProperty.call(answers, k) && !byId[k]) {
      return "unknown field: " + k;
    }
  }
  return true;
}

function jsonOut_(obj, status) {
  var s = JSON.stringify(obj);
  var o = ContentService.createTextOutput(s);
  o.setMimeType(ContentService.MimeType.JSON);
  if (status >= 400) {
    // GAS only reliably returns 200; clients should check "error" in body.
  }
  return o;
}
