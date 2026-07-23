# Rallie court finder app

## Local server

This is a static web app. Serve the repo root with any local static server:

```bash
python3 -m http.server 8092 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8092/`.

## Supabase public reports

Shared public reports use Supabase. Before report submissions can work:

1. Create a Supabase project on the Free plan.
2. Open the Supabase SQL editor.
3. Run `supabase/schema.sql`.
4. In Supabase, copy the project URL and anon public key from Project Settings.
5. Replace the placeholder values in `config/supabaseConfig.js`.

If the project contains the original fake QA reports, run
`supabase/cleanup_fake_reports_2026_07_22.sql` once in the Supabase SQL
editor. It deletes only the 13 known test-report IDs and installs the
open-court/waiting-party consistency constraint.

Never put the Supabase service-role key in frontend code. Only use the anon public key.
