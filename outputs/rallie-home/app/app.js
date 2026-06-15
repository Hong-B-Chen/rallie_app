import { loadCourts } from "./data/courts.js";
import { handleAction } from "./actions.js";
import { renderApp } from "./router.js";
import { getSavedCourtIds } from "./storage/savedCourts.js";
import { timeAgo } from "./lib/timeAgo.js";
import { applyReportsToCourts } from "./lib/reportModels.js";
import {
  fetchPublicReportsForCourt,
  fetchRecentPublicReports,
  insertPublicReport,
  isPublicReportsConfigured,
} from "./lib/supabaseReports.js";

const state = {
  screen: window.location.hash === "#report" ? "report" : window.location.hash === "#detail" ? "detail" : "home",
  court: null,
  reportStep: "name",
  reporterName: "",
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
  recentlyViewedIds: [],
  reportSyncStatus: "idle",
  reportSyncMessage: "",
  reportSubmitStatus: "idle",
  reportSubmitMessage: "",
};

// Load the DPR court database before the first render.
const courts = await loadCourts();
state.court = courts[0] || null;
await loadPublicReports();

function render() {
  renderApp({ state, courts });
}

// All buttons declare behavior with data-action attributes.
document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  await handleAction({
    action: target.dataset.action,
    target,
    state,
    courts,
    render,
    reportApi,
  });
});

// Live search: update only the suggestions dropdown without a full re-render
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
  // Remove existing suggestions
  const existing = wrapper.querySelector(".search-suggestions");
  if (existing) existing.remove();

  const q = query.trim().toLowerCase();
  if (!q) return;

  const startsWith = courts.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = courts.filter((c) => !c.name.toLowerCase().startsWith(q) && (c.name.toLowerCase().includes(q) || c.neighborhood.toLowerCase().includes(q)));
  const suggestions = [...startsWith, ...contains].slice(0, 6);
  if (!suggestions.length) return;

  const ul = document.createElement("ul");
  ul.className = "search-suggestions";
  ul.setAttribute("role", "listbox");
  ul.innerHTML = suggestions.map((court) => `
    <li class="search-suggestion-item" role="option" data-action="select-court" data-court-id="${court.id}">
      <span class="suggestion-name">${court.name.replace(/</g, "&lt;")}</span>
      <span class="suggestion-meta">${court.neighborhood.replace(/</g, "&lt;")}</span>
    </li>`).join("");
  wrapper.appendChild(ul);
}

// Press Enter on search → navigate to first suggestion
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const input = event.target.closest("[data-action='search-court']");
  if (!input) return;
  event.preventDefault();
  const first = document.querySelector(".search-suggestion-item");
  if (first) {
    handleAction({ action: "select-court", target: first, state, courts, render, reportApi });
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-submit-action]");
  if (!form) return;

  event.preventDefault();
  await handleAction({
    action: form.dataset.submitAction,
    target: form,
    state,
    courts,
    render,
    reportApi,
  });
});

// Prevent iOS from scrolling the page when the reporter name input is tapped.
// By intercepting touchstart and calling focus({ preventScroll: true }),
// we take control of focus before iOS can trigger its scroll-to-input behaviour.
document.addEventListener("touchstart", (e) => {
  if (e.target.id === "reporterName") {
    e.preventDefault();
    e.target.focus({ preventScroll: true });
  }
}, { passive: false });

// Update report timestamps live every 30 seconds without a full re-render
setInterval(() => {
  document.querySelectorAll("time[data-timestamp]").forEach((el) => {
    el.textContent = timeAgo(Number(el.dataset.timestamp));
  });
}, 30_000);

render();

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

const reportApi = {
  fetchPublicReportsForCourt,
  insertPublicReport,
};
