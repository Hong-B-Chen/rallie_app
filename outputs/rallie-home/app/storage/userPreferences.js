const RECENT_COURTS_KEY = "rallie.recentCourtIds";
const REPORTER_NAME_KEY = "rallie.reporterName";

export function getRecentCourtIds() {
  return readJsonArray(RECENT_COURTS_KEY).slice(0, 3);
}

export function rememberRecentCourt(courtId) {
  const nextIds = [courtId, ...getRecentCourtIds().filter((id) => id !== courtId)].slice(0, 3);
  writeValue(RECENT_COURTS_KEY, JSON.stringify(nextIds));
  return nextIds;
}

export function getReporterName() {
  try {
    return localStorage.getItem(REPORTER_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberReporterName(name) {
  writeValue(REPORTER_NAME_KEY, String(name || "").trim());
}

function readJsonArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The app remains usable when storage is blocked or full.
  }
}
