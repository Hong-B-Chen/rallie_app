import { removeCourtId, saveCourtId } from "./storage/savedCourts.js";
import { applyInsertedReportToCourt } from "./lib/reportModels.js";
import { rememberRecentCourt, rememberReporterName } from "./storage/userPreferences.js";

export async function handleAction({ action, target, state, courts, render, reportApi }) {
  // This keeps UI events in one place so page modules stay mostly presentational.
  if (action === "home") state.screen = "home";

  if (action === "court-detail") state.screen = "detail";

  if (action === "report-name") {
    state.reportStep = "name";
    state.screen = "report";
  }

  if (action === "back-to-submitted-court") {
    state.submitted = true;
    state.screen = "detail";
  }

  if (action === "check-court") {
    checkCourtByPosterId({ target, state, courts });
  }

  if (action === "search-court") {
    // Handled by the input event listener in app.js (no re-render needed)
    return;
  }

  if (action === "clear-search") {
    state.courtSearchQuery = "";
    state.courtLookupMessage = "";
    state.screen = "home";
  }

  if (action === "share-court" && state.court) {
    await shareCourt({ state, render });
    return;
  }

  if (action === "copy-address" && state.court) {
    await copyCourtAddress({ target, state, render });
    return;
  }

  if (action === "check-court-by-name") {
    checkCourtByName({ state, courts });
    if (state.court && state.screen === "detail") trackRecentlyViewed(state, state.court.id);
  }

  if (action === "select-court") {
    state.court = courts.find((court) => court.id === target.dataset.courtId) || courts[0] || null;
    state.submitted = false;
    state.courtLookupMessage = "";
    state.courtSearchQuery = "";
    if (state.court) trackRecentlyViewed(state, state.court.id);
    state.screen = "detail";
  }

  if (action === "start-report" && state.court) {
    state.reportStep = "name";
    state.reportMode = "occupied";
    state.openCourts = 0;
    state.waitingParties = 1;
    state.queueAnswer = "Yep";
    state.arrival = "Just got here";
    state.reporterNameMessage = "";
    state.gpsEnabled = false;
    state.gpsStatus = "idle";
    state.gpsMessage = "";
    state.gpsTrusted = false;
    state.gpsDistanceMiles = null;
    state.reportSubmitStatus = "idle";
    state.reportSubmitMessage = "";
    state.screen = "report";
  }

  if (action === "save-reporter-name") {
    saveReporterName({ target, state, render });
  }

  if (action === "toggle-save-court" && state.court) {
    state.savedCourtIds = state.savedCourtIds.includes(state.court.id)
      ? removeCourtId(state.court.id)
      : saveCourtId(state.court.id);
  }

  if (action === "toggle-gps") {
    toggleGpsValidation({ state, render });
    return;
  }

  if (action === "arrival") state.arrival = target.dataset.value;
  if (action === "queue") state.queueAnswer = target.dataset.value;
  if (action === "parties") {
    const partyRow = document.querySelector(".party-row");
    const savedScroll = partyRow ? partyRow.scrollLeft : 0;
    state.waitingParties = Number(target.dataset.value);
    render();
    requestAnimationFrame(() => {
      const newPartyRow = document.querySelector(".party-row");
      if (newPartyRow) newPartyRow.scrollLeft = savedScroll;
    });
    return;
  }

  if (action === "counter" && state.court) {
    const direction = Number(target.dataset.direction);
    state.openCourts = Math.max(0, Math.min(state.court.total, state.openCourts + direction));
    state.reportMode = state.openCourts === 0 ? "occupied" : "open";
    state.waitingParties = state.openCourts > 0 ? 0 : Math.max(1, state.waitingParties);
  }

  if (action === "submit-report") {
    await submitReport({ state, courts, reportApi, render });
    render();
    return;
  }

  render();
}

function checkCourtByName({ state, courts }) {
  const q = (state.courtSearchQuery || "").trim().toLowerCase();

  if (!q) {
    state.courtLookupMessage = "Enter a court name to search.";
    state.screen = "home";
    return;
  }

  const matches = courts.filter((court) =>
    court.name.toLowerCase().includes(q) || court.neighborhood.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    state.courtLookupMessage = `No court found matching "${state.courtSearchQuery}".`;
    state.screen = "home";
    return;
  }

  state.court = matches[0];
  state.submitted = false;
  state.courtLookupMessage = "";
  state.courtSearchQuery = "";
  state.screen = "detail";
}

function checkCourtByPosterId({ target, state, courts }) {
  const form = target.closest("form") || target;
  const formData = new FormData(form);
  const posterId = normalizePosterId(formData.get("courtId"));

  if (!posterId) {
    state.courtLookupMessage = "Enter the court ID posted at the court.";
    state.screen = "home";
    return;
  }

  const matches = courts.filter((court) => normalizePosterId(court.posterId) === posterId);

  if (matches.length === 0) {
    state.courtLookupMessage = `No court found for ID ${posterId}.`;
    state.screen = "home";
    return;
  }

  state.court = matches[0];
  state.submitted = false;
  state.courtLookupMessage = "";
  state.screen = "detail";
}

function saveReporterName({ target, state, render }) {
  const form = target.closest("form") || target;
  const formData = new FormData(form);
  const reporterName = String(formData.get("reporterName") || "").trim();

  if (!reporterName) {
    state.reporterNameMessage = "Enter your name to continue.";
    state.reportStep = "name";
    state.screen = "report";
    return;
  }

  state.reporterName = reporterName;
  rememberReporterName(reporterName);
  state.reporterNameMessage = "";
  state.reportStep = "details";
  state.screen = "report";

  // Auto-enable GPS on details page
  toggleGpsValidation({ state, render });
}

async function submitReport({ state, courts, reportApi, render }) {
  if (!state.court) return;
  if (state.reportSubmitStatus === "submitting") return;

  const court = state.court;
  state.reportSubmitStatus = "submitting";
  state.reportSubmitMessage = "";
  render();

  try {
    const insertedReport = await reportApi.insertPublicReport({
      courtId: court.id,
      reporterName: state.reporterName || "You",
      openCourts: state.openCourts,
      waitingParties: state.openCourts > 0 ? 0 : Math.max(1, state.waitingParties),
      arrivalStatus: state.arrival,
      gpsValidated: state.gpsTrusted,
      gpsDistanceMiles: state.gpsDistanceMiles,
    });

    const nextCourt = applyInsertedReportToCourt(courts, court.id, insertedReport);
    state.court = nextCourt || {
      ...court,
      open: state.openCourts,
      queue: state.openCourts > 0 ? 0 : Math.max(1, state.waitingParties),
      status: state.openCourts === 0 ? "BUSY" : "LIVE",
    };
    state.submitted = true;
    state.reportStep = "confirmation";
    state.reportSubmitStatus = "idle";
    state.reportSubmitMessage = "";
    state.screen = "report";
    state.savedCourtIds = saveCourtId(state.court.id);
  } catch (error) {
    state.reportSubmitStatus = "error";
    state.reportSubmitMessage = error.message || "Report could not be submitted. Please try again.";
    state.screen = "report";
  }
}

function normalizePosterId(value) {
  return String(value || "").trim().toUpperCase();
}

function toggleGpsValidation({ state, render }) {
  if (state.gpsEnabled) {
    state.gpsEnabled = false;
    state.gpsStatus = "idle";
    state.gpsMessage = "";
    state.gpsTrusted = false;
    state.gpsDistanceMiles = null;
    render();
    return;
  }

  if (!state.court?.lat || !state.court?.lon) {
    state.gpsEnabled = false;
    state.gpsStatus = "unavailable";
    state.gpsMessage = "GPS validation is not available for this court.";
    state.gpsTrusted = false;
    render();
    return;
  }

  if (!navigator.geolocation) {
    state.gpsEnabled = false;
    state.gpsStatus = "unavailable";
    state.gpsMessage = "Location is not supported by this browser.";
    state.gpsTrusted = false;
    render();
    return;
  }

  state.gpsEnabled = true;
  state.gpsStatus = "checking";
  state.gpsMessage = "Checking your distance from this court...";
  state.gpsTrusted = false;
  render();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const distanceMiles = distanceInMiles({
        fromLat: position.coords.latitude,
        fromLon: position.coords.longitude,
        toLat: Number(state.court.lat),
        toLon: Number(state.court.lon),
      });

      state.gpsDistanceMiles = distanceMiles;
      state.gpsTrusted = distanceMiles <= 0.1243;
      state.gpsStatus = state.gpsTrusted ? "validated" : "too-far";
      const distanceFt = Math.round(distanceMiles * 5280);
      state.gpsMessage = state.gpsTrusted
        ? "Location validated for this court."
        : `You are ${distanceFt} ft away (max 656 ft).`;
      render();
    },
    (err) => {
      state.gpsEnabled = false;
      state.gpsStatus = "denied";
      state.gpsMessage = err.code === 1
        ? "Location permission was not granted."
        : err.code === 2
        ? "Location unavailable. Please try again."
        : "Location request timed out. Please try again.";
      state.gpsTrusted = false;
      state.gpsDistanceMiles = null;
      render();
    },
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
  );
}

function distanceInMiles({ fromLat, fromLon, toLat, toLon }) {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(toLat - fromLat);
  const lonDelta = toRadians(toLon - fromLon);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function trackRecentlyViewed(state, courtId) {
  state.recentlyViewedIds = rememberRecentCourt(courtId);
}

async function shareCourt({ state, render }) {
  const court = state.court;
  const url = `${window.location.origin}${window.location.pathname}#court/${encodeURIComponent(court.id)}`;
  const shareData = {
    title: `${court.name} on Rallie`,
    text: `Check the latest community court status for ${court.name}.`,
    url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      showActionMessage({ state, render, message: "Court shared" });
      return;
    }

    await copyText(url);
    showActionMessage({ state, render, message: "Court link copied" });
  } catch (error) {
    if (error?.name !== "AbortError") showActionMessage({ state, render, message: "Unable to share this court" });
  }
}

async function copyCourtAddress({ target, state, render }) {
  const address = target.dataset.address || `${state.court.name}, ${state.court.neighborhood}, New York, NY`;

  try {
    await copyText(address);
    showActionMessage({ state, render, message: "Address copied" });
  } catch {
    showActionMessage({ state, render, message: "Unable to copy the address" });
  }
}

function showActionMessage({ state, render, message }) {
  state.actionMessage = message;
  render();
  window.clearTimeout(state.actionMessageTimer);
  state.actionMessageTimer = window.setTimeout(() => {
    state.actionMessage = "";
    render();
  }, 2400);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  if (!copied) throw new Error("Copy was not available.");
}
