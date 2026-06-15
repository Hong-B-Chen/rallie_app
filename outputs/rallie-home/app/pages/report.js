import { icon } from "../components/icons.js";
import { topHeader } from "../components/topHeader.js";
import { escapeHtml } from "../lib/html.js";

export function renderReportPage({ state }) {
  const occupied = state.reportMode === "occupied";
  const court = state.court;
  if (!court) return `${topHeader({ back: true, filter: true })}<div class="report-page page-scroll"><p>No court selected.</p></div>`;
  if (state.reportStep === "name") return reporterNamePage({ state, court });
  if (state.reportStep === "confirmation") return confirmationPage();

  return `<header class="report-flow-top-bar">
      <button type="button" data-action="court-detail" aria-label="Back">${icon("back")}</button>
    </header>
    <div class="report-details-page page-scroll">
      <h1>Validate your location helps others trust your report.</h1>
      <section class="gps-validate-row ${state.gpsEnabled ? "enabled" : ""}">
        <button type="button" data-action="toggle-gps" aria-pressed="${state.gpsEnabled}" aria-label="Validate with GPS">
          ${icon("check")}<span>Validate with GPS</span><span class="gps-switch"></span>
        </button>
        ${state.gpsMessage ? `<p class="gps-message ${state.gpsStatus}">${escapeHtml(state.gpsMessage)}</p>` : ""}
      </section>
      <section class="report-card">
        <h2>Just arrived or wrapping up?</h2>
        <div class="segmented">
          ${["Just got here", "Heading out"].map((label) => optionButton({ label, active: state.arrival === label, action: "arrival" })).join("")}
        </div>
      </section>
      <section class="report-card">
        <h2>How many courts are open?</h2>
        <div class="counter">
          <button type="button" data-action="counter" data-direction="-1">${icon("minus")}</button>
          <div><strong>${state.openCourts}</strong><span>Courts</span></div>
          <button type="button" data-action="counter" data-direction="1">${icon("plus")}</button>
        </div>
      </section>
      <section class="report-card">
        <h2>How many parties are waiting?</h2>
        <div class="party-row">
          ${partyOptions({ occupied, waitingParties: state.waitingParties })}
        </div>
      </section>
    </div>
    <footer class="fixed-cta">
      <button class="submit-report" type="button" data-action="submit-report" ${state.gpsStatus === "too-far" || state.reportSubmitStatus === "submitting" ? "disabled" : ""}>
        ${state.reportSubmitStatus === "submitting" ? "Submitting..." : "Submit Report"}
      </button>
      ${state.reportSubmitMessage ? `<p class="report-submit-message ${state.reportSubmitStatus}">${escapeHtml(state.reportSubmitMessage)}</p>` : ""}
      <p class="report-note">Reporting helps update live status for nearby players.</p>
    </footer>`;
}

function reporterNamePage({ state, court }) {
  return `<header class="report-name-top-bar">
      <button type="button" data-action="court-detail" aria-label="Back">${icon("back")}</button>
    </header>
    <form id="reporterNameForm" class="report-name-page page-scroll" data-submit-action="save-reporter-name">
      <h1>Wished you knew before coming? <span>Help the next person.</span></h1>
      <h2>Report for a Court</h2>
      <section class="report-name-court">${icon("pin")}<span>${escapeHtml(court.reportName)}</span></section>
      <section class="report-name-card">
        <label for="reporterName">What's your name?</label>
        <div class="report-name-input">
          <input id="reporterName" name="reporterName" autocomplete="off" placeholder="Enter your name" value="${escapeHtml(state.reporterName)}" />
          ${icon("user")}
        </div>
        ${state.reporterNameMessage ? `<p class="report-name-error">${escapeHtml(state.reporterNameMessage)}</p>` : ""}
      </section>
    </form>
    <footer class="fixed-cta">
      <button class="report-name-next" type="submit" form="reporterNameForm">Next</button>
      <p class="report-note">Reporting helps update live status for nearby players.</p>
    </footer>`;
}

function confirmationPage() {
  return `<header class="report-flow-top-bar">
      <button type="button" data-action="court-detail" aria-label="Back">${icon("back")}</button>
    </header>
    <section class="confirmation-page page-scroll">
      <div class="confirmation-content">
        <div class="confirmation-art">
          <svg width="100%" viewBox="0 0 342 144" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#cc0)"><path d="M293.36 109.471L242.322 107.639L263.719 61.2636M316.676 102.515C297.448 114.339 273.751 110.734 263.747 94.4638C253.743 78.1934 261.221 55.4183 280.449 43.5943C299.677 31.7702 323.374 35.3748 333.378 51.6453C343.382 67.9157 335.904 90.6908 316.676 102.515ZM239.854 103.614L244.794 111.649C245.704 113.128 245.242 115.064 243.763 115.974L219.66 130.796C218.181 131.705 216.244 131.243 215.335 129.764L210.395 121.73C209.485 120.251 209.947 118.314 211.426 117.405L235.529 102.583C237.008 101.673 238.945 102.135 239.854 103.614Z" stroke="#2A3400" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M310.123 65.8951L310.07 65.9281M287.318 79.9654L287.264 79.9984M305.678 84.3438L305.625 84.3768M291.751 61.5674L291.698 61.6003" stroke="#2A3400" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><g clip-path="url(#cc1)"><path d="M185.561 91.9171C189.347 102.294 184.005 113.775 173.628 117.561C163.252 121.347 151.771 116.005 147.985 105.628M153.773 83.5668C155.541 82.0552 157.604 80.8286 159.917 79.9844C162.231 79.1403 164.599 78.7499 166.925 78.7679" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M153.85 89.5075L155.572 91.1457C155.809 91.3748 156.267 91.5103 156.59 91.4504L158.498 91.0955C159.718 90.8692 160.296 91.6115 159.77 92.7435L158.886 94.6627C158.737 94.9877 158.775 95.4953 158.969 95.7982L160.005 97.3967C160.825 98.6623 160.293 99.4618 158.818 99.1822L156.765 98.7913C156.395 98.7205 155.893 98.9036 155.65 99.1985L154.331 100.819C153.389 101.981 152.459 101.708 152.273 100.218L152.036 98.3276C151.989 97.9713 151.692 97.5583 151.368 97.406L149.456 96.5068C148.331 95.9774 148.289 95.0397 149.368 94.427L151.056 93.4698C151.336 93.3097 151.599 92.911 151.633 92.5832L151.895 90.2211C152.04 88.9383 152.919 88.6175 153.85 89.5075Z" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M172.639 82.6518L174.36 84.2901C174.597 84.5192 175.055 84.6546 175.378 84.5947L177.286 84.2399C178.506 84.0136 179.084 84.7559 178.558 85.8878L177.675 87.8071C177.525 88.1321 177.563 88.6397 177.757 88.9425L178.794 90.541C179.613 91.8067 179.081 92.6061 177.606 92.3266L175.554 91.9357C175.183 91.8649 174.681 92.0479 174.438 92.3429L173.12 93.9635C172.177 95.1253 171.247 94.8528 171.061 93.3625L170.825 91.472C170.778 91.1157 170.48 90.7027 170.156 90.5504L168.244 89.6511C167.119 89.1217 167.077 88.1841 168.156 87.5714L169.844 86.6142C170.124 86.4541 170.387 86.0554 170.421 85.7276L170.683 83.3654C170.828 82.0826 171.707 81.7618 172.639 82.6518Z" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M161.314 107.152C163.861 108.808 167.128 109.288 170.201 108.167C173.274 107.046 175.464 104.574 176.345 101.667" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/></g><g clip-path="url(#cc2)"><path d="M240.597 25.5171C238.612 36.3829 228.194 43.5821 217.328 41.597C206.462 39.6118 199.263 29.194 201.248 18.3282C203.233 7.46231 213.651 0.263105 224.517 2.24827C235.383 4.23344 242.582 14.6512 240.597 25.5171Z" stroke="#56670E" stroke-width="0.8"/><path d="M209.667 5.63452C216.251 13.9954 213.795 27.6589 204.634 33.1786" stroke="#56670E" stroke-width="0.8"/><path d="M232.178 38.2108C225.561 29.8084 228.095 16.1592 237.211 10.6667" stroke="#56670E" stroke-width="0.8"/></g><g clip-path="url(#cc3)"><path d="M78.6975 103.638C77.2086 111.787 69.3953 117.186 61.2459 115.698C53.0965 114.209 47.6971 106.395 49.186 98.246C50.6749 90.0966 58.4882 84.6972 66.6376 86.1861C74.787 87.675 80.1864 95.4883 78.6975 103.638Z" stroke="#56670E" stroke-width="0.8"/><path d="M55.4998 88.7258C60.4383 94.9965 58.5963 105.244 51.7256 109.384" stroke="#56670E" stroke-width="0.8"/><path d="M72.3837 113.158C67.4207 106.856 69.3211 96.6193 76.1579 92.4999" stroke="#56670E" stroke-width="0.8"/></g><g clip-path="url(#cc4)"><circle cx="124.014" cy="37.0135" r="18.3333" transform="rotate(40.4238 124.014 37.0135)" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M120.602 26.8827C120.201 27.9448 120.494 29.1994 121.421 29.9893C122.349 30.7792 123.634 30.8686 124.619 30.3045M130.541 35.3488C130.141 36.4109 130.433 37.6655 131.361 38.4554C132.288 39.2453 133.573 39.3347 134.558 38.7707" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M114.865 36.4453C114.694 39.2246 115.787 42.0473 118.07 43.9918C120.352 45.9363 123.313 46.5663 126.03 45.9557" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/></g><g clip-path="url(#cc5)"><path d="M51.2181 33.1187C50.113 34.4683 48.7519 35.6466 47.1556 36.5756C39.9955 40.7423 30.8132 38.3158 26.6464 31.1557C22.4797 23.9956 24.9062 14.8133 32.0663 10.6465C39.3849 6.38752 49.0496 9.2177 52.9368 16.7239" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M44.2071 16.5975C43.5821 15.5235 42.2047 15.1595 41.1307 15.7846C40.0567 16.4096 39.6927 17.7869 40.3177 18.8609" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.1735 22.7327L32.1619 22.7395" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M38.5269 27.7129C39.4885 27.1533 41.6129 26.4094 42.799 26.6076C43.8793 26.7881 42.2683 28.406 42.5294 28.8546C42.7905 29.3033 45.0694 28.4935 44.6163 29.7303C44.2026 30.8595 42.5064 32.3391 41.5447 32.8987" stroke="#56670E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M51.3367 21.8381C52.0861 20.5746 53.7166 20.2121 55.0485 21.0481C56.3802 21.8847 56.9276 23.6015 56.3226 24.9562L55.0517 27.4091C54.4358 28.5978 54.1279 29.1922 53.5617 29.3305C52.9955 29.4688 52.4 29.095 51.2089 28.3476L48.752 26.8057C47.4784 25.9098 47.0003 24.1731 47.6887 22.8461C48.3786 21.5177 49.9852 21.0863 51.3367 21.8381Z" stroke="#56670E" stroke-width="0.8" stroke-linejoin="round"/></g></g><defs><clipPath id="cc0"><rect width="342" height="144" fill="white"/></clipPath><clipPath id="cc1"><rect width="48" height="48" fill="white" transform="translate(136 84.4536) rotate(-20.0465)"/></clipPath><clipPath id="cc2"><rect width="48" height="48" fill="white" transform="translate(201.627 -6) rotate(10.3536)"/></clipPath><clipPath id="cc3"><rect width="36" height="36" fill="white" transform="translate(49.47 80) rotate(10.3536)"/></clipPath><clipPath id="cc4"><rect width="44" height="44" fill="white" transform="translate(121.531 6) rotate(40.4238)"/></clipPath><clipPath id="cc5"><rect width="36" height="36" fill="white" transform="translate(15 17.1072) rotate(-30.197)"/></clipPath></defs></svg>
        </div>
        <h1>Score! The community thanks you.</h1>
      </div>
      <footer class="fixed-cta">
        <button type="button" data-action="back-to-submitted-court">Back to court details</button>
        <p class="report-note">Reporting helps update live status for nearby players.</p>
      </footer>
    </section>`;
}

function queueQuestion(state) {
  return `<section class="report-card">
    <h2>Are you in the queue?</h2>
    <div class="segmented">
      ${["Yep", "Nope, heading out"].map((label) => optionButton({ label, active: state.queueAnswer === label, action: "queue" })).join("")}
    </div>
  </section>`;
}

function partyOptions({ occupied, waitingParties }) {
  const labels = occupied ? ["1", "2", "3", "4", "5", "5+"] : ["0", "1", "2", "3", "4", "5", "5+"];

  return labels.map((label, index) => {
    const value = label === "5+" ? 6 : Number(label);
    const active = waitingParties === value || (!occupied && index === 0 && waitingParties === 0);
    return `<button class="${active ? "active" : ""}" type="button" data-action="parties" data-value="${value}">${label}</button>`;
  }).join("");
}

function optionButton({ label, active, action }) {
  return `<button class="${active ? "active" : ""}" type="button" data-action="${action}" data-value="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
}
