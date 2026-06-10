const SHEET_NAME = "Signups";
const HEADERS = [
  "Received At",
  "Name",
  "Email",
  "Phone",
  "SMS Consent",
  "Preferences",
  "Source URL",
  "Submitted At",
  "Court / Location",
];

function doPost(event) {
  const sheet = getSheet();
  const payload = JSON.parse(event.postData.contents || "{}");
  const submittedAt = parseSubmittedAt(payload.submittedAt);

  sheet.appendRow([
    new Date(),
    payload.name || "",
    payload.email || "",
    payload.phone || "",
    payload.smsConsent === true ? "yes" : "no",
    Array.isArray(payload.preferences) ? payload.preferences.join(", ") : "",
    payload.sourceUrl || "",
    submittedAt,
    payload.courtLocation || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    normalizeHeaders(sheet);
  }

  return sheet;
}

function normalizeHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), HEADERS.length);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const courtIndex = headers.indexOf("Court");
  const courtIdIndex = headers.indexOf("Court ID");

  if (courtIndex >= 0 && courtIdIndex === courtIndex + 1) {
    sheet.deleteColumns(courtIndex + 1, 2);
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function parseSubmittedAt(value) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
