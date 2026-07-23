const SAVED_COURTS_KEY = "rallie.savedCourtIds";

export function getSavedCourtIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_COURTS_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveCourtId(courtId) {
  const savedCourtIds = getSavedCourtIds();
  const nextSavedCourtIds = savedCourtIds.includes(courtId) ? savedCourtIds : [courtId, ...savedCourtIds];

  writeSavedCourtIds(nextSavedCourtIds);
  return nextSavedCourtIds;
}

export function removeCourtId(courtId) {
  const nextSavedCourtIds = getSavedCourtIds().filter((savedCourtId) => savedCourtId !== courtId);

  writeSavedCourtIds(nextSavedCourtIds);
  return nextSavedCourtIds;
}

function writeSavedCourtIds(courtIds) {
  try {
    localStorage.setItem(SAVED_COURTS_KEY, JSON.stringify(courtIds));
  } catch {
    // Saving remains non-blocking when browser storage is unavailable.
  }
}
