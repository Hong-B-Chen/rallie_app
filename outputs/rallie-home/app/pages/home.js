import { icon } from "../components/icons.js";
import { escapeHtml } from "../lib/html.js";
import { timeAgo } from "../lib/timeAgo.js";
import { getCourtStatus } from "../lib/courtStatus.js";

const FEATURED_NYC_COURT_IDS = ["m010-2", "b073", "b058"];

export function renderHomePage({ state, courts, savedCourtIds }) {
  const recentlyViewedCourts = (state.recentlyViewedIds || [])
    .slice(0, 3)
    .map((courtId) => courts.find((court) => court.id === courtId))
    .filter(Boolean);

  const savedCourts = savedCourtIds
    .map((courtId) => courts.find((court) => court.id === courtId))
    .filter(Boolean);
  const featuredNycCourts = FEATURED_NYC_COURT_IDS
    .map((courtId) => courts.find((court) => court.id === courtId))
    .filter(Boolean);

  const query = state.courtSearchQuery || "";
  const suggestions = getSearchSuggestions({ query, courts });
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;
  const showNoResults = query.trim().length > 0 && suggestions.length === 0;

  return `${homeHeader()}
    <div class="home-page page-scroll">
      <section class="home-intro">
        <span class="eyebrow">Live court availability</span>
        <h1>Spend less time waiting.<br />Play more tennis.</h1>
        <p>Check recent court reports before you head out.</p>
      </section>
      <div class="home-search-wrapper">
        <div class="home-search">${icon("search")}<input
          name="courtSearch"
          id="courtSearch"
          autocomplete="off"
          aria-label="Search courts by name or neighborhood"
          placeholder="Search by court or neighborhood"
          value="${escapeHtml(query)}"
          data-action="search-court"
        /><button class="search-clear" type="button" data-action="clear-search" aria-label="Clear search" ${query ? "" : "hidden"}>${icon("close")}</button></div>
        ${showSuggestions ? `<ul class="search-suggestions" aria-label="Court suggestions">
          ${suggestions.map((court) => `<li><button class="search-suggestion-item" type="button" data-action="select-court" data-court-id="${court.id}">
            <span class="suggestion-name">${escapeHtml(court.name)}</span>
            <span class="suggestion-meta">${icon("pin")} ${escapeHtml(court.neighborhood)}</span>
          </button></li>`).join("")}
        </ul>` : ""}
        ${showNoResults ? `<div class="search-no-results" role="status"><strong>No courts found</strong><span>Try another court or neighborhood.</span></div>` : ""}
      </div>
      ${stateMessage({ state })}
      ${state.reportSyncStatus === "loading" ? `<div class="sync-status" role="status"><span class="spinner"></span> Refreshing live reports…</div>` : ""}
      ${recentlyViewedCourts.length ? courtSection("Recently viewed", recentlyViewedCourts) : ""}
      ${savedCourts.length ? courtSection("Saved courts", savedCourts) : ""}
      ${courtSection("Featured around NYC", featuredNycCourts, "Iconic, high-capacity tennis centers")}
    </div>`;
}

function getSearchSuggestions({ query, courts }) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Rank: starts-with first, then contains
  const startsWith = courts.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = courts.filter((c) => !c.name.toLowerCase().startsWith(q) && (c.name.toLowerCase().includes(q) || c.neighborhood.toLowerCase().includes(q)));
  return [...startsWith, ...contains].slice(0, 6);
}

function highlightMatch(name, query) {
  // Return plain text — HTML escaping handled by caller via escapeHtml
  return name;
}

function stateMessage({ state }) {
  const message = state.courtLookupMessage || (state.reportSyncStatus === "error" ? state.reportSyncMessage : "");
  return message ? `<p class="court-lookup-message" role="alert">${escapeHtml(message)}</p>` : "";
}

function homeHeader() {
  return `<header class="top-header home-header">
    <button class="brand" type="button" data-action="home" aria-label="Rallie home">
      <strong>Rallie</strong>
    </button>
    <span class="community-pill"><span></span> Community powered</span>
  </header>`;
}

function homeCard(court) {
  const courtStatus = getCourtStatus(court);
  const latest = courtStatus.latestReport;
  const statusLabel = courtStatus.isCurrent ? `${court.open} of ${court.total} courts open` : courtStatus.label;
  return `<button class="home-card ${courtStatus.kind}" type="button" data-action="select-court" data-court-id="${court.id}" aria-label="View ${escapeHtml(court.name)}, ${statusLabel}">
    <div class="home-card-top">
      <div><h3>${escapeHtml(court.name)}</h3><p class="court-location">${icon("pin")} ${escapeHtml(court.neighborhood)}</p></div>
      <span class="badge ${courtStatus.kind}">${courtStatus.label}</span>
    </div>
    <div class="court-card-stats">
      ${courtStatus.isCurrent
        ? `<div class="availability-stat"><strong>${court.open}<span>/${court.total}</span></strong><small>courts open</small></div>
           <div class="queue-stat">${icon("people")}<span><strong>${court.queue}</strong><small>waiting</small></span></div>`
        : `<div class="availability-stat official"><strong>${court.total}</strong><small>courts on site</small></div>
           <div class="queue-stat unavailable">${icon("people")}<span><strong aria-label="Not reported">&mdash;</strong><small>wait not reported</small></span></div>`}
      <span class="card-chevron">${icon("chevron")}</span>
    </div>
    <div class="card-freshness ${courtStatus.kind}">${courtStatus.kind === "unknown" ? icon("sparkle") : icon("clock")} ${courtStatus.isCurrent ? `Updated ${timeAgo(latest.time)}` : courtStatus.kind === "stale" ? `Last report ${timeAgo(latest.time)} · Needs a fresh update` : "Be the first to update this court"}</div>
  </button>`;
}

function courtSection(title, courtList, subtitle = "") {
  return `<section class="home-section">
    <div class="section-heading"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div><span>${courtList.length}</span></div>
    <div class="court-list">${courtList.map(homeCard).join("")}</div>
  </section>`;
}
