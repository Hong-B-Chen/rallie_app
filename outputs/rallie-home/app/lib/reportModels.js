export function applyReportsToCourts(courts, reports) {
  const reportsByCourtId = groupReportsByCourtId(reports);

  courts.forEach((court, index) => {
    const courtReports = reportsByCourtId.get(court.id) || [];
    const latestReport = courtReports[0];

    const nextCourt = {
      ...court,
      reports: courtReports,
    };

    if (latestReport) {
      nextCourt.open = latestReport.openCourts;
      nextCourt.queue = latestReport.waitingParties;
      nextCourt.status = latestReport.openCourts === 0 ? "BUSY" : "LIVE";
    }

    courts[index] = nextCourt;
  });
}

export function applyReportsToCourt(courts, courtId, reports) {
  const index = courts.findIndex((court) => court.id === courtId);
  if (index < 0) return null;

  const sortedReports = normalizeReportList(reports);
  const latestReport = sortedReports[0];
  const nextCourt = {
    ...courts[index],
    reports: sortedReports,
  };

  if (latestReport) {
    nextCourt.open = latestReport.openCourts;
    nextCourt.queue = latestReport.waitingParties;
    nextCourt.status = latestReport.openCourts === 0 ? "BUSY" : "LIVE";
  }

  courts[index] = nextCourt;
  return nextCourt;
}

export function applyInsertedReportToCourt(courts, courtId, row) {
  const index = courts.findIndex((court) => court.id === courtId);
  if (index < 0) return null;

  const insertedReport = normalizeReport({ ...row, court_id: row?.court_id || courtId });
  const existingReports = courts[index].reports || [];
  const reports = [
    insertedReport,
    ...existingReports.filter((report) => report.id !== insertedReport.id),
  ].sort((a, b) => b.time - a.time);
  const nextCourt = {
    ...courts[index],
    reports,
    open: insertedReport.openCourts,
    queue: insertedReport.waitingParties,
    status: insertedReport.openCourts === 0 ? "BUSY" : "LIVE",
  };

  courts[index] = nextCourt;
  return nextCourt;
}

export function normalizeReport(row) {
  const createdAt = Date.parse(row.created_at);
  const openCourts = Math.max(0, Number(row.open_courts) || 0);
  const reportedWaitingParties = Math.max(0, Number(row.waiting_parties) || 0);
  const waitingParties = openCourts > 0 ? 0 : Math.max(1, reportedWaitingParties);

  return {
    id: row.id,
    courtId: row.court_id,
    name: row.reporter_name || "Someone",
    time: Number.isFinite(createdAt) ? createdAt : Date.now(),
    headline: openCourts === 0 ? "All courts occupied" : `${openCourts} courts open`,
    waitingParties,
    openCourts,
    arrivalStatus: row.arrival_status || "Just got here",
    alert: openCourts === 0,
    gpsValidated: Boolean(row.gps_validated),
    gpsDistanceMiles: row.gps_distance_miles == null ? null : Number(row.gps_distance_miles),
  };
}

function groupReportsByCourtId(reports) {
  const grouped = new Map();
  normalizeReportList(reports).forEach((report) => {
    const courtReports = grouped.get(report.courtId) || [];
    courtReports.push(report);
    grouped.set(report.courtId, courtReports);
  });
  return grouped;
}

function normalizeReportList(reports) {
  return reports
    .map(normalizeReport)
    .sort((a, b) => b.time - a.time);
}
