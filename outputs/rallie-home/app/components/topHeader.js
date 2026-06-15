import { icon } from "./icons.js";

export function topHeader({ back = false, filter = false, pin = false } = {}) {
  return `<header class="top-header">
    <div class="brand-side">
      ${back ? `<button type="button" data-action="home" aria-label="Back">${icon("back")}</button>` : icon("search")}
      <strong>Rallie</strong>
    </div>
    <div class="header-actions">
      <button type="button" aria-label="Search">${icon("search")}</button>
      <button type="button" aria-label="${filter ? "Filter" : pin ? "Location" : "Profile"}">${icon(filter ? "filter" : pin ? "pin" : "user")}</button>
    </div>
  </header>`;
}
