const customIcons = {
  back: `<svg class="icon" width="32" height="32" viewBox="0 0 29 29" fill="none" aria-hidden="true"><circle cx="14.0833" cy="14.0833" r="13.3333" stroke="currentColor" stroke-width="1"/><path d="M16.0833 19.4167C16.0833 19.4167 12.0834 15.4887 12.0834 14.0833C12.0834 12.6779 16.0834 8.75 16.0834 8.75" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart: `<svg class="icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" stroke-width="1"/><path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  send: `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12L8 12M12.5002 8.5C12.5002 8.5 16.0002 11.0777 16.0002 12C16.0002 12.9223 12.5002 15.5 12.5002 15.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  people: `<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 21c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pin: `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1"/></svg>`,
};

const paths = {
  back: '',
  heart: '',
  search: '<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" />',
  info: '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  check: '<circle cx="12" cy="12" r="10" /><path d="m8 12 2.5 2.5L16 9" />',
  plus: '<path d="M12 5v14" /><path d="M5 12h14" />',
  minus: '<path d="M5 12h14" />',
  filter: '<path d="M4 6h16" /><path d="M8 12h8" /><path d="M11 18h2" />',
  target: '<circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3" /><path d="M12 19v3" /><path d="M2 12h3" /><path d="M19 12h3" />',
  send: '<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />',
  user: '<circle cx="12" cy="8" r="4" /><path d="M4 21c1.8-4 14.2-4 16 0" />',
};

export function icon(name) {
  if (customIcons[name]) return customIcons[name];
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
}
