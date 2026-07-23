import { icon } from "../components/icons.js";
import { topHeader } from "../components/topHeader.js";
import { escapeHtml } from "../lib/html.js";
import { timeAgo } from "../lib/timeAgo.js";
import { getCourtStatus } from "../lib/courtStatus.js";

export function renderDetailPage({ state }) {
  const court = state.court;
  if (!court) return `${topHeader({ back: true })}<div class="detail-page page-scroll">${emptyHistory("No court selected.")}</div>`;
  const saved = state.savedCourtIds.includes(court.id);
  const courtStatus = getCourtStatus(court);
  const latestReport = courtStatus.latestReport;
  const availabilityPercent = court.total && court.open != null ? Math.max(0, Math.min(100, (court.open / court.total) * 100)) : 0;

  return `<header class="detail-top-bar">
      <button type="button" data-action="navigate-back" data-fallback-action="home" aria-label="Back">${icon("back")}</button>
      <span class="detail-bar-title">Court details</span>
      <button class="favorite-button ${saved ? "saved" : ""}" type="button" data-action="toggle-save-court" aria-label="${saved ? "Unsave court" : "Save court"}" aria-pressed="${saved}">${icon("heart")}</button>
    </header>
    <div class="detail-page page-scroll">
      <section class="detail-title">
        <span class="eyebrow">${courtTypeLabel(court.type)}</span>
        <h1>${escapeHtml(court.detailName)}</h1>
        <p>${icon("pin")} ${escapeHtml(court.neighborhood)}</p>
      </section>
      ${state.submitted ? `<div class="success" role="status">${icon("check")} Your report is live. Thanks for helping the community.</div>` : ""}
      <section class="status-panel ${courtStatus.kind}" aria-label="Current court availability">
        <div class="status-panel-head">
          <span class="status-kicker"><span class="status-dot"></span> ${courtStatus.label}</span>
          <span class="freshness">${courtStatus.kind === "unknown" ? icon("sparkle") : icon("clock")} ${latestReport ? `${courtStatus.isCurrent ? "Updated" : "Last report"} ${timeAgo(latestReport.time)}` : "Awaiting a report"}</span>
        </div>
        ${courtStatus.kind === "unknown" ? unknownStatusContent(court) : reportedStatusContent({ court, courtStatus, availabilityPercent })}
      </section>
      ${visitActions(court)}
      <section class="court-info">
        <div class="info-head"><div><span class="section-label">THE BASICS</span><h2>Court information</h2></div>${icon("info")}</div>
        ${infoRow("Surface", court.surface)}
        ${infoRow("Type", court.type)}
        ${infoRow("Phone", court.phone)}
      </section>
      <section class="history">
        <div class="history-heading"><div><span class="section-label">COMMUNITY UPDATES</span><h2>Report history</h2></div><span>${court.reports.length}</span></div>
        ${court.reports.length ? `<div class="history-list">${court.reports.map(reportCard).join("")}</div>` : `<div class="history-empty">${icon("sparkle")}<strong>Be the first to report</strong><p>No recent updates for this court yet.</p></div>`}
      </section>
    </div>
    <footer class="fixed-cta"><button type="button" data-action="start-report" ${state.submitted ? "disabled" : ""}>${state.submitted ? `${icon("check")} Report submitted` : `${icon("send")} Report court status`}</button><p class="report-note">Takes about 20 seconds · Helps nearby players</p></footer>`;
}

function unknownStatusContent(court) {
  return `<div class="unknown-status-summary">
    <div class="official-capacity"><strong>${court.total}</strong><span>courts<br />on site</span></div>
    <p>Live availability starts with the first community report.</p>
  </div>
  <div class="unknown-status-prompt">${icon("sparkle")} Be the first to update this court</div>`;
}

function reportedStatusContent({ court, courtStatus, availabilityPercent }) {
  return `<div class="availability-summary ${courtStatus.kind}">
    <div class="availability-number"><strong>${court.open}</strong><span>of ${court.total}<br />${courtStatus.isCurrent ? "courts open" : "at last report"}</span></div>
    <div class="queue-summary">${icon("people")}<span><strong>${court.queue}</strong> ${court.queue === 1 ? "group" : "groups"}<small>${courtStatus.isCurrent ? "currently waiting" : "at last report"}</small></span></div>
  </div>
  <div class="availability-track ${courtStatus.kind}" aria-hidden="true"><span style="width: ${availabilityPercent}%"></span></div>
  <p class="confidence-note">${courtStatus.isCurrent ? "Based on a recent community report." : "This report is no longer considered current. A fresh update would help."}</p>`;
}

function visitActions(court) {
  const address = courtAddress(court);
  const mapQuery = court.lat && court.lon ? `${court.lat},${court.lon}` : address;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return `<section class="visit-actions" aria-label="Plan your visit">
    <div class="visit-actions-heading"><span class="section-label">PLAN YOUR VISIT</span><h2>Useful shortcuts</h2></div>
    <div class="visit-action-grid">
      <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">${icon("directions")}<span>Directions</span></a>
      <button type="button" data-action="share-court">${icon("share")}<span>Share</span></button>
      <button type="button" data-action="copy-address" data-address="${escapeHtml(address)}">${icon("copy")}<span>Copy address</span></button>
    </div>
  </section>`;
}

function infoRow(label, value) {
  const displayValue = courtDetailValue(value);
  const unavailable = displayValue === "Not listed";
  return `<div class="info-row"><span>${label}</span><strong class="${unavailable ? "unavailable" : ""}">${escapeHtml(displayValue)}</strong></div>`;
}

function courtDetailValue(value) {
  const text = String(value ?? "").trim();
  return !text || /^(unknown|not available|n\/?a|null|undefined)$/i.test(text) ? "Not listed" : text;
}

function courtTypeLabel(type) {
  const value = courtDetailValue(type);
  if (value === "Indoor") return "Indoor court";
  if (value === "Outdoor") return "Outdoor court";
  return "Tennis court";
}

function courtAddress(court) {
  const location = courtDetailValue(court.neighborhood);
  const parts = [court.name];
  if (location !== "Not listed") parts.push(location);

  const hasState = /\b[A-Z]{2}(?:\s+\d{5}(?:-\d{4})?)?\s*$/i.test(location);
  if (location !== "Not listed" && !hasState) parts.push("New York, NY");
  return parts.join(", ");
}

function waitingText(report) {
  const n = report.waitingParties ?? 0;
  const name = escapeHtml(report.name);
  if (n <= 0) return "No one waiting";
  if (n === 1) return `${name} is waiting`;
  if (n === 2) return `${name} and another party are waiting`;
  return `${name} and ${n - 1} other parties are waiting`;
}

function reportCard(report) {
  const gpsValidation = report.gpsValidated ? `<span class="validated-report">${icon("check")} Location validated</span>` : "";

  return `<article class="report-history-card">
    <div class="report-marker ${report.alert ? "alert" : ""}"></div>
    <div class="report-card-body">
      <div class="report-top"><span><strong>${escapeHtml(report.name)}</strong> reported</span><time data-timestamp="${report.time}">${timeAgo(report.time)}</time></div>
      <h3><span class="${report.alert ? "red-dot" : "green-dot"}"></span>${escapeHtml(report.headline)}</h3>
      <p>${icon("people")} ${waitingText(report)}</p>
      <span class="arrival-status">${escapeHtml(report.arrivalStatus)}</span>
      ${gpsValidation}
    </div>
  </article>`;
}

function emptyHistory(message) {
  return `<article class="report-history-card empty-state"><p>${escapeHtml(message)}</p></article>`;
}
