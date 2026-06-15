import { icon } from "../components/icons.js";
import { escapeHtml } from "../lib/html.js";

export function renderHomePage({ state, courts, savedCourtIds }) {
  const recentlyViewedCourts = (state.recentlyViewedIds || [])
    .slice(0, 3)
    .map((courtId) => courts.find((court) => court.id === courtId))
    .filter(Boolean);

  const savedCourts = savedCourtIds
    .map((courtId) => courts.find((court) => court.id === courtId))
    .filter(Boolean);

  const query = state.courtSearchQuery || "";
  const suggestions = getSearchSuggestions({ query, courts });
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;

  return `${homeHeader()}
    <div class="home-page page-scroll">
      <div class="home-search-wrapper">
        <label class="home-search">${icon("search")}<input
          name="courtSearch"
          id="courtSearch"
          autocomplete="off"
          placeholder="Search courts by name"
          value="${escapeHtml(query)}"
          data-action="search-court"
        /></label>
        ${showSuggestions ? `<ul class="search-suggestions" role="listbox">
          ${suggestions.map((court) => `<li class="search-suggestion-item" role="option" data-action="select-court" data-court-id="${court.id}">
            <span class="suggestion-name">${escapeHtml(court.name)}</span>
            <span class="suggestion-meta">${escapeHtml(court.neighborhood)}</span>
          </li>`).join("")}
        </ul>` : ""}
      </div>
      ${stateMessage({ state })}
      <section class="home-section">
        <h2>Recently Viewed</h2>
        ${recentlyViewedCourts.length ? recentlyViewedCourts.map(homeCard).join("") : emptyState("Courts you view will appear here.")}
      </section>
      <section class="home-section">
        <h2>Saved</h2>
        ${savedCourts.length ? savedCourts.map(homeCard).join("") : emptyState("Courts you save will appear here.")}
      </section>
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
  return message ? `<p class="court-lookup-message">${escapeHtml(message)}</p>` : "";
}

function homeHeader() {
  return `<header class="top-header home-header">
    <strong>Rallie</strong>
  </header>`;
}

function homeCard(court) {
  return `<article class="home-card" role="button" tabindex="0" data-action="select-court" data-court-id="${court.id}">
    <div class="home-card-top">
      <h3>${escapeHtml(court.name)}</h3>
      <span class="${court.status === "BUSY" ? "badge busy" : "badge live"}">${court.status === "BUSY" ? "BUSY" : "OPEN"}</span>
    </div>
    <div class="mini-meta">${court.open}/${court.total} Open</div>
    <div class="queue-row">
      <span>${icon("people")} Queue Status</span>
      <strong>${court.queue} waiting</strong>
    </div>
  </article>`;
}

function emptyState(message) {
  return `<article class="home-card empty-state"><p>${escapeHtml(message)}</p></article>`;
}
