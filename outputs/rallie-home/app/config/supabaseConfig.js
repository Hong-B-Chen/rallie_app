export const SUPABASE_URL = "https://inhumvplklwdweaqcerd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaHVtdnBsa2x3ZHdlYXFjZXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Nzc4MTEsImV4cCI6MjA5NzA1MzgxMX0.AILsYkHHn09U0meAlvIQxswDt2QrtNZeDKlWLBD-gbg";

export function hasSupabaseConfig() {
  return (
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.length > 40 &&
    !SUPABASE_URL.includes("REPLACE_WITH") &&
    !SUPABASE_ANON_KEY.includes("REPLACE_WITH")
  );
}
