create table if not exists public.court_reports (
  id uuid primary key default gen_random_uuid(),
  court_id text not null,
  reporter_name text,
  open_courts integer not null check (open_courts >= 0),
  waiting_parties integer not null check (waiting_parties >= 0),
  arrival_status text not null check (arrival_status in ('Just got here', 'Heading out')),
  gps_validated boolean not null default false,
  gps_distance_miles numeric,
  created_at timestamptz not null default now()
);

alter table public.court_reports
drop constraint if exists court_reports_queue_consistency_check;

alter table public.court_reports
add constraint court_reports_queue_consistency_check check (
  (open_courts > 0 and waiting_parties = 0)
  or (open_courts = 0 and waiting_parties >= 1)
);

alter table public.court_reports enable row level security;

drop policy if exists "Public can read court reports" on public.court_reports;
create policy "Public can read court reports"
on public.court_reports
for select
to anon
using (true);

drop policy if exists "Public can insert court reports" on public.court_reports;
create policy "Public can insert court reports"
on public.court_reports
for insert
to anon
with check (
  court_id <> ''
  and open_courts >= 0
  and waiting_parties >= 0
  and arrival_status in ('Just got here', 'Heading out')
);

create index if not exists court_reports_court_created_idx
on public.court_reports (court_id, created_at desc);
