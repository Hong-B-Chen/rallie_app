import { renderHomePage } from "./pages/home.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderReportPage } from "./pages/report.js";

// Screen depth used to determine slide direction
const SCREEN_DEPTH = { home: 0, detail: 1, report: 2 };

let lastScreen = "home";

export function renderApp({ state, courts }) {
  const root = document.querySelector("#root");
  const content = renderScreen({ state, courts });

  const screenChanged = state.screen !== lastScreen;
  const currentDepth = SCREEN_DEPTH[state.screen] ?? 0;
  const lastDepth = SCREEN_DEPTH[lastScreen] ?? 0;
  const goingForward = currentDepth > lastDepth;
  lastScreen = state.screen;

  const doRender = () => {
    root.innerHTML = `<main class="app-shell"><section class="phone">${content}</section></main>`;
  };

  // Only animate when navigating between screens
  if (!screenChanged || !document.startViewTransition) {
    doRender();
    return;
  }

  // Set direction hint on root before transition
  root.dataset.navDirection = goingForward ? "forward" : "back";

  document.startViewTransition(() => {
    doRender();
  });
}

function renderScreen({ state, courts }) {
  if (state.screen === "report") return renderReportPage({ state });
  if (state.screen === "detail") return renderDetailPage({ state });
  return renderHomePage({ state, courts, savedCourtIds: state.savedCourtIds });
}
