/**
 * TAB India — Google Apps Script
 * ─────────────────────────────────────────────────────────────────────────────
 * DEPLOY INSTRUCTIONS:
 *  1. Open https://script.google.com  →  New Project
 *  2. Paste this entire file, replacing the default code.
 *  3. Set SPREADSHEET_ID below (the long ID from your Google Sheet URL).
 *  4. Click  Deploy → New deployment → Web app
 *       Execute as:  Me
 *       Who has access:  Anyone
 *  5. Click Deploy → copy the Web App URL.
 *  6. Paste that URL into  .env.local  as:
 *       VITE_SHEETS_URL=https://script.google.com/macros/s/YOUR_ID/exec
 *  7. Restart the dev server / redeploy to Vercel.
 *
 * THREE SHEETS are created automatically inside the same spreadsheet:
 *   • "Leads"             — rank-prediction form submissions
 *   • "Counselling"       — counselling booking form submissions
 *   • "College Predictor" — college predictor form submissions  ← NEW
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ← PASTE YOUR GOOGLE SHEET ID HERE (from the URL between /d/ and /edit)
var SPREADSHEET_ID = "1fvjknHqJIC1udEIMtGcvSK1iAuGec2WCHYrCWsgHqvg";

/* ── Column headers ── */
var LEAD_HEADERS = [
  "Timestamp", "Name", "Phone", "Email", "City",
  "NEET Score", "Predicted Rank", "Rank From", "Rank To"
];

var COUNSEL_HEADERS = [
  "Timestamp", "Name", "Phone", "Email", "City", "State",
  "Category", "Preferred Course", "NEET Score", "Query / Message"
];

var COLLEGE_HEADERS = [
  "Timestamp", "Name", "Phone", "Estimated Rank", "Preferred Course",
  "Domicile State", "Education State",
  "State Quota Category", "AIQ / Central Category",
  "Budget", "Preferred States"
];

/* ── Entry point for POST requests ── */
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);
    var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (data.type === "college-predictor") {
      writeRow(ss, "College Predictor", COLLEGE_HEADERS, [
        new Date().toLocaleString("en-IN"),
        data.name             || "",
        data.phone            || "",
        data.estimatedRank    || "",
        data.preferredCourse  || "",
        data.domicileState    || "",
        data.educationState   || "",
        data.domicileCategory || "",
        data.centralCategory  || "",
        data.budget           || "",
        data.preferredStates  || ""
      ]);

    } else if (data.type === "counselling") {
      writeRow(ss, "Counselling", COUNSEL_HEADERS, [
        new Date().toLocaleString("en-IN"),
        data.name        || "",
        data.phone       || "",
        data.email       || "",
        data.city        || "",
        data.state       || "",
        data.category    || "",
        data.course      || "",
        data.neetScore   || "",
        data.message     || ""
      ]);

    } else {
      // default: rank-prediction lead
      writeRow(ss, "Leads", LEAD_HEADERS, [
        new Date().toLocaleString("en-IN"),
        data.name          || "",
        data.phone         || "",
        data.email         || "",
        data.city          || "",
        data.score         || "",
        data.predictedRank || "",
        data.predictedFrom || "",
        data.predictedTo   || ""
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ── GET handler (health check) ── */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "TAB India webhook active" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Helper: write a row, auto-creating the sheet + header if needed ── */
function writeRow(ss, sheetName, headers, values) {
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Bold header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0a2844");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }

  sheet.appendRow(values);
}
