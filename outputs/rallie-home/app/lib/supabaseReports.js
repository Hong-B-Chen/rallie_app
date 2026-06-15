import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from "../config/supabaseConfig.js";

const RECENT_REPORT_LIMIT = 250;
const COURT_REPORT_LIMIT = 25;
let clientPromise = null;

export function isPublicReportsConfigured() {
  return hasSupabaseConfig();
}

export async function fetchRecentPublicReports() {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("court_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(RECENT_REPORT_LIMIT);

  if (error) throw new Error(error.message || "Unable to load public reports.");
  return data || [];
}

export async function fetchPublicReportsForCourt(courtId) {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("court_reports")
    .select("*")
    .eq("court_id", courtId)
    .order("created_at", { ascending: false })
    .limit(COURT_REPORT_LIMIT);

  if (error) throw new Error(error.message || "Unable to load this court's reports.");
  return data || [];
}

export async function insertPublicReport(report) {
  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("court_reports")
    .insert({
      court_id: report.courtId,
      reporter_name: report.reporterName || null,
      open_courts: report.openCourts,
      waiting_parties: report.waitingParties,
      arrival_status: report.arrivalStatus,
      gps_validated: report.gpsValidated,
      gps_distance_miles: report.gpsDistanceMiles,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message || "Unable to submit report.");
  return data;
}

async function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured yet. Add your project URL and anon key before submitting public reports.");
  }

  if (!clientPromise) {
    clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  }

  return clientPromise;
}
