import { loadCourts } from "./data/courts.js";
import { handleAction } from "./actions.js";
import { renderApp } from "./router.js";
import { getSavedCourtIds } from "./storage/savedCourts.js";
import { getRecentCourtIds, getReporterName, rememberRecentCourt } from "./storage/userPreferences.js";
import { timeAgo } from "./lib/timeAgo.js";
import { escapeHtml } from "./lib/html.js";
import { applyReportsToCourts } from "./lib/reportModels.js";
import {
  fetchRecentPublicReports,
  insertPublicReport,
  isPublicReportsConfigured,
} from "./lib/supabaseReports.js";

const state = {
  screen: "home",
  court: null,
  reportStep: "name",
  reporterName: getReporterName(),
  reporterNameMessage: "",
  gpsEnabled: false,
  gpsStatus: "idle",
  gpsMessage: "",
  gpsTrusted: false,
  gpsDistanceMiles: null,
  reportMode: "open",
  arrival: "Just got here",
  openCourts: 0,
  queueAnswer: "Yep",
  waitingParties: 0,
  submitted: false,
  savedCourtIds: getSavedCourtIds(),
  courtLookupMessage: "",
  courtSearchQuery: "",
  recentlyViewedIds: getRecentCourtIds(),
  reportSyncStatus: "idle",
  reportSyncMessage: "",
  reportSubmitStatus: "idle",
  reportSubmitMessage: "",
  actionMessage: "",
  actionMessageTimer: null,
  isOffline: !navigator.onLine,
};

const reportApi = {
  insertPublicReport,
};

// Load the official court directory, then layer community reports over it.
const courts = await loadCourts();
state.court = courts[0] || null;
applyRouteFromHash();
window.history.replaceState({ rallie: true, rallieIndex: 0 }, "", routeForState());
const reportsReady = loadPublicReports();
render();
reportsReady.finally(render);

function render() {
  renderApp({ state, courts });
}

async function dispatchAction(action, target) {
  const previousRoute = routeForState();
  await handleAction({ action, target, state, courts, render, reportApi });
  const nextRoute = routeForState();
  if (nextRoute !== previousRoute) {
    const replacesCurrentRoute = ["home", "court-detail", "report-name", "back-to-submitted-court", "submit-report"].includes(action);
    const currentIndex = Number(window.history.state?.rallieIndex) || 0;
    const nextIndex = replacesCurrentRoute ? currentIndex : currentIndex + 1;
    window.history[replacesCurrentRoute ? "replaceState" : "pushState"]({ rallie: true, rallieIndex: nextIndex }, "", nextRoute);
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  if (target.dataset.action === "navigate-back") {
    const currentIndex = Number(window.history.state?.rallieIndex) || 0;
    if (currentIndex > 0) window.history.back();
    else await dispatchAction(target.dataset.fallbackAction, target);
    return;
  }
  if (target.dataset.action === "finish-report") {
    const currentIndex = Number(window.history.state?.rallieIndex) || 0;
    if (currentIndex > 0) window.history.go(-Math.min(2, currentIndex));
    else await dispatchAction("back-to-submitted-court", target);
    return;
  }
  await dispatchAction(target.dataset.action, target);
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".home-search-wrapper")) return;
  closeSearchSuggestions();
});

document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-action='search-court']");
  if (!input) return;
  const query = input.value || "";
  state.courtSearchQuery = query;
  state.courtLookupMessage = "";
  updateSearchSuggestions({ query, courts, wrapper: input.closest(".home-search-wrapper") });
});

function updateSearchSuggestions({ query, courts, wrapper }) {
  if (!wrapper) return;
  closeSearchSuggestions(wrapper);

  const q = query.trim().toLowerCase();
  const clearButton = wrapper.querySelector(".search-clear");
  if (clearButton) clearButton.hidden = !q;
  if (!q) return;

  const startsWith = courts.filter((court) => court.name.toLowerCase().startsWith(q));
  const contains = courts.filter((court) =>
    !court.name.toLowerCase().startsWith(q) &&
    (court.name.toLowerCase().includes(q) || court.neighborhood.toLowerCase().includes(q))
  );
  const suggestions = [...startsWith, ...contains].slice(0, 6);

  if (!suggestions.length) {
    const empty = document.createElement("div");
    empty.className = "search-no-results";
    empty.setAttribute("role", "status");
    empty.innerHTML = "<strong>No courts found</strong><span>Try another court or neighborhood.</span>";
    wrapper.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "search-suggestions";
  list.setAttribute("aria-label", "Court suggestions");
  list.innerHTML = suggestions.map((court) => `
    <li><button class="search-suggestion-item" type="button" data-action="select-court" data-court-id="${court.id}">
      <span class="suggestion-name">${escapeHtml(court.name)}</span>
      <span class="suggestion-meta">${escapeHtml(court.neighborhood)}</span>
    </button></li>`).join("");
  wrapper.appendChild(list);
}

function closeSearchSuggestions(wrapper = document) {
  wrapper.querySelector(".search-suggestions")?.remove();
  wrapper.querySelector(".search-no-results")?.remove();
}

document.addEventListener("keydown", async (event) => {
  const input = event.target.closest("[data-action='search-court']");
  const suggestion = event.target.closest(".search-suggestion-item");
  const suggestionButtons = [...document.querySelectorAll(".search-suggestion-item")];

  if (input) {
    if (event.key === "ArrowDown" && suggestionButtons[0]) {
      event.preventDefault();
      suggestionButtons[0].focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (suggestionButtons[0]) await dispatchAction("select-court", suggestionButtons[0]);
    } else if (event.key === "Escape") {
      closeSearchSuggestions();
      input.blur();
    }
    return;
  }

  if (!suggestion) return;
  const index = suggestionButtons.indexOf(suggestion);
  if (event.key === "ArrowDown") {
    event.preventDefault();
    suggestionButtons[(index + 1) % suggestionButtons.length]?.focus();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    (index === 0 ? document.querySelector("[data-action='search-court']") : suggestionButtons[index - 1])?.focus();
  } else if (event.key === "Escape") {
    document.querySelector("[data-action='search-court']")?.focus();
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-submit-action]");
  if (!form) return;
  event.preventDefault();
  await dispatchAction(form.dataset.submitAction, form);
});

let routeApplyQueued = false;
function handleHistoryNavigation() {
  if (routeApplyQueued) return;
  routeApplyQueued = true;
  queueMicrotask(() => {
    routeApplyQueued = false;
    applyRouteFromHash();
    render();
  });
}

window.addEventListener("popstate", handleHistoryNavigation);
window.addEventListener("hashchange", handleHistoryNavigation);
window.addEventListener("online", () => { state.isOffline = false; render(); });
window.addEventListener("offline", () => { state.isOffline = true; render(); });

setInterval(() => {
  document.querySelectorAll("time[data-timestamp]").forEach((element) => {
    element.textContent = timeAgo(Number(element.dataset.timestamp));
  });
  if (state.screen !== "report" && !document.activeElement?.matches("input")) render();
}, 60_000);

render();

function routeForState() {
  if (state.screen === "detail" && state.court) return `#court/${encodeURIComponent(state.court.id)}`;
  if (state.screen === "report" && state.court) return `#report/${encodeURIComponent(state.court.id)}/${state.reportStep}`;
  return "#home";
}

function applyRouteFromHash() {
  const [section, encodedCourtId, step] = window.location.hash.replace(/^#/, "").split("/");
  const courtId = encodedCourtId ? decodeURIComponent(encodedCourtId) : "";
  const routeCourt = courts.find((court) => court.id === courtId);

  if (section === "court" && routeCourt) {
    state.court = routeCourt;
    state.recentlyViewedIds = rememberRecentCourt(routeCourt.id);
    state.screen = "detail";
    return;
  }

  if (section === "report" && routeCourt) {
    state.court = routeCourt;
    state.reportStep = ["name", "details", "confirmation"].includes(step) ? step : "name";
    state.screen = "report";
    return;
  }

  state.screen = "home";
}

async function loadPublicReports() {
  if (!isPublicReportsConfigured()) {
    state.reportSyncStatus = "not-configured";
    state.reportSyncMessage = "Public reports are not connected yet.";
    return;
  }

  state.reportSyncStatus = "loading";
  try {
    const reports = await fetchRecentPublicReports();
    applyReportsToCourts(courts, reports);
    state.court = state.court ? courts.find((court) => court.id === state.court.id) || state.court : courts[0] || null;
    state.reportSyncStatus = "ready";
    state.reportSyncMessage = "";
  } catch (error) {
    state.reportSyncStatus = "error";
    state.reportSyncMessage = error.message || "Public reports could not be loaded.";
  }
}
