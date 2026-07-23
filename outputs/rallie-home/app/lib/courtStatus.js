export const LIVE_REPORT_WINDOW_MS = 90 * 60 * 1000;

export function getCourtStatus(court, now = Date.now()) {
  const latestReport = court?.reports?.[0] || null;

  if (!latestReport || !Number.isFinite(Number(latestReport.time))) {
    return {
      kind: "unknown",
      label: "No recent report",
      latestReport: null,
      isCurrent: false,
    };
  }

  const ageMs = Math.max(0, now - Number(latestReport.time));
  if (ageMs > LIVE_REPORT_WINDOW_MS) {
    return {
      kind: "stale",
      label: "Update needed",
      latestReport,
      ageMs,
      isCurrent: false,
    };
  }

  return {
    kind: latestReport.openCourts === 0 ? "busy" : "live",
    label: latestReport.openCourts === 0 ? "Likely full" : "Live update",
    latestReport,
    ageMs,
    isCurrent: true,
  };
}
