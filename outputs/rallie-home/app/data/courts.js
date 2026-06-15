const FALLBACK_PHONE = "Not available";
const FALLBACK_SURFACE = "Unknown";

export async function loadCourts() {
  const response = await fetch("./DPR_Tennis_001.json");
  if (!response.ok) throw new Error("Unable to load tennis court data.");

  const rawCourts = await response.json();
  const usedIds = new Map();

  // Duplicate Prop_ID values exist in the DPR file, so ids are made unique.
  return rawCourts.map((rawCourt, index) => normalizeCourt(rawCourt, index, usedIds));
}

// The UI uses a smaller court model than the DPR source file provides.
export function normalizeCourt(rawCourt, index, usedIds) {
  const baseId = slugify(rawCourt.Prop_ID || rawCourt.Name || `court-${index + 1}`);
  const id = uniqueId(baseId, usedIds);
  const total = Math.max(0, Number(rawCourt.Courts) || 0);

  return {
    id,
    sourceId: rawCourt.Prop_ID || "",
    posterId: id.toUpperCase(),
    name: rawCourt.Name || "Unnamed court",
    detailName: rawCourt.Name || "Unnamed court",
    reportName: rawCourt.Name || "Unnamed court",
    neighborhood: rawCourt.Location || "Location unavailable",
    distance: "",
    status: "LIVE",
    queue: 0,
    open: total,
    total,
    surface: rawCourt.Tennis_Type || FALLBACK_SURFACE,
    type: rawCourt.Indoor_Outdoor || "Unknown",
    phone: rawCourt.Phone || FALLBACK_PHONE,
    accessible: rawCourt.Accessible || null,
    info: rawCourt.Info || "",
    lat: rawCourt.lat || null,
    lon: rawCourt.lon || null,
    reports: [],
  };
}

function uniqueId(baseId, usedIds) {
  const count = usedIds.get(baseId) || 0;
  usedIds.set(baseId, count + 1);
  return count === 0 ? baseId : `${baseId}-${count + 1}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
