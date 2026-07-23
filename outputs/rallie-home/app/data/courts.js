const FALLBACK_DETAIL = "Not listed";

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
  const coordinates = normalizeUsCoordinates(rawCourt.lat, rawCourt.lon);

  return {
    id,
    sourceId: rawCourt.Prop_ID || "",
    posterId: id.toUpperCase(),
    name: rawCourt.Name || "Unnamed court",
    detailName: rawCourt.Name || "Unnamed court",
    reportName: rawCourt.Name || "Unnamed court",
    neighborhood: rawCourt.Location || "Location unavailable",
    distance: "",
    status: "UNKNOWN",
    queue: 0,
    open: null,
    total,
    surface: cleanDetail(rawCourt.Tennis_Type),
    type: cleanDetail(rawCourt.Indoor_Outdoor),
    phone: cleanDetail(rawCourt.Phone),
    accessible: rawCourt.Accessible || null,
    info: rawCourt.Info || "",
    lat: coordinates.lat,
    lon: coordinates.lon,
    reports: [],
  };
}

function normalizeUsCoordinates(rawLat, rawLon) {
  if (rawLat == null || rawLon == null || rawLat === "" || rawLon === "") {
    return { lat: null, lon: null };
  }

  const lat = Number(rawLat);
  const lon = Number(rawLon);
  const isPlausibleUsCoordinate =
    Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= 18 && lat <= 72 && lon >= -180 && lon <= -60;

  return isPlausibleUsCoordinate
    ? { lat: String(rawLat), lon: String(rawLon) }
    : { lat: null, lon: null };
}

function cleanDetail(value) {
  const text = String(value ?? "").trim();
  return text || FALLBACK_DETAIL;
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
