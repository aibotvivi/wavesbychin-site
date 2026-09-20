// Site configuration. Safe to commit: the Supabase anon key and the GA
// measurement ID are both public by design. Row-level security on the
// `inquiries` table is what protects the data (see supabase/inquiries.sql).
//
// SUPABASE_URL / SUPABASE_ANON_KEY blank  -> forms show "couldn't send" with the
//                                            mailto fallback; nothing is stored.
// GA_MEASUREMENT_ID blank                 -> no analytics at all, and the cookie
//                                            banner is not shown (nothing to consent to).
window.WBC_CONFIG = {
  SUPABASE_URL: "https://wkkyoszrdontvziehaku.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra3lvc3pyZG9udHZ6aWVoYWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTQyODMsImV4cCI6MjA5NDY3MDI4M30.9FF2MLAXEHo9Ks4peFz9CgutpeYyNyVQ9FzAj8ySuFw",
  SUPABASE_TABLE: "inquiries",
  GA_MEASUREMENT_ID: "G-E058XXVER6",
  INNERWAVE_URL: "https://github.com/aibotvivi/innerwaves",
  INSTAGRAM_URL: "https://www.instagram.com/wavesbychin/",
  EMAIL: "wavesbychin@gmail.com"
};
