import { icon } from "../components/icons.js";
import { topHeader } from "../components/topHeader.js";
import { escapeHtml } from "../lib/html.js";
import { timeAgo } from "../lib/timeAgo.js";

export function renderDetailPage({ state }) {
  const court = state.court;
  if (!court) return `${topHeader({ back: true })}<div class="detail-page page-scroll">${emptyHistory("No court selected.")}</div>`;
  const saved = state.savedCourtIds.includes(court.id);

  return `<header class="detail-top-bar">
      <button type="button" data-action="home" aria-label="Back">${icon("back")}</button>
      <button class="favorite-button ${saved ? "saved" : ""}" type="button" data-action="toggle-save-court" aria-label="${saved ? "Unsave court" : "Save court"}" aria-pressed="${saved}">${icon("heart")}</button>
    </header>
    <div class="detail-page page-scroll">
      <section class="detail-title">
        <h1>${escapeHtml(court.detailName)}</h1>
        <p>${escapeHtml(court.neighborhood)}</p>
      </section>
      <section class="status-panel ${court.open === 0 ? "full" : "available"}">
        <div class="status-icon">${icon("people")}</div>
        <div>
          <h2>${availabilityLabel(court)}</h2>
          <p>${court.queue} Groups currently waiting</p>
        </div>
        <span class="status-dot"></span>
      </section>
      <section class="court-info">
        <div class="info-head"><h2>Court Info</h2>${icon("info")}</div>
        ${infoRow("Surface", court.surface)}
        ${infoRow("Type", court.type)}
        ${infoRow("Phone", court.phone)}
      </section>
      <section class="history">
        <h2>Report History</h2>
        ${court.reports.length ? court.reports.map(reportCard).join("") : `<p class="history-empty">No reports yet.</p>`}
      </section>
    </div>
    <footer class="fixed-cta"><button type="button" data-action="start-report" ${state.submitted ? 'disabled' : ''}>${state.submitted ? `${icon("check")} Report submitted` : `${icon("check")} I'm at the court`}</button><p class="report-note">Reporting helps update live status for nearby players.</p></footer>`;
}

function availabilityLabel(court) {
  if (court.open === 0) return "Likely Full";
  if (court.open >= court.total) return "Likely Empty";
  return "Likely Busy";
}

function infoRow(label, value) {
  return `<div class="info-row"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function waitingText(report) {
  const n = report.waitingParties ?? 0;
  const name = escapeHtml(report.name);
  if (n <= 0) return "No one waiting";
  if (n === 1) return `${name} is waiting`;
  if (n === 2) return `${name} and another party are waiting`;
  return `${name} and other ${n - 1} parties are waiting`;
}

function reportCard(report) {
  const gpsValidation = report.gpsValidated ? ` · <span class="validated-report">Location validated ${icon("check")}</span>` : "";

  return `<article class="report-history-card">
    <div class="report-top"><span><strong>${escapeHtml(report.name)}</strong> reported</span><time data-timestamp="${report.time}">${timeAgo(report.time)}</time></div>
    <h3>${escapeHtml(report.headline)} <span class="${report.alert ? "red-dot" : "green-dot"}"></span></h3>
    <p>${icon("people")} ${waitingText(report)}${gpsValidation}</p>
  </article>`;
}

function emptyHistory(message) {
  return `<article class="report-history-card empty-state"><p>${escapeHtml(message)}</p></article>`;
}
