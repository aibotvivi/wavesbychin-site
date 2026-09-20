-- Message form + newsletter box for wavesbychin.
--
-- Run this once in the SQL editor of the Supabase project the site uses
-- (the same project as the portfolio):
--   https://supabase.com/dashboard/project/wkkyoszrdontvziehaku/sql/new
--
-- The page ships the project's anon key, which is public by design. Row level
-- security is therefore the only thing protecting this table: the policy below
-- grants INSERT and nothing else, so the browser can add a row and cannot read
-- anything back. Do not add a SELECT policy, and never put the service_role
-- key in the page — it bypasses RLS entirely.

create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  kind       text not null,                 -- 'message' | 'subscribe'
  type       text,                          -- 'general' | 'corporate'   (message only)
  company    text,
  name       text,
  email      text not null,
  people     text,
  date       text,
  format     text,
  message    text,
  page       text,                          -- hash route the form was sent from
  source     text not null,                 -- always 'wavesbychin-site'
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

drop policy if exists "anon can send" on public.inquiries;
create policy "anon can send"
  on public.inquiries
  for insert
  to anon
  with check (
    -- shape checks, so the table cannot be used as free storage
    source = 'wavesbychin-site'
    and kind in ('message', 'subscribe')
    and char_length(email) between 6 and 254
    and email like '%_@_%._%'
    and (type is null or type in ('general', 'corporate'))
    and (format is null or format in ('workshop', 'series', 'awayday', 'unsure'))
    and coalesce(char_length(message), 0) <= 4000
    and coalesce(char_length(company), 0) <= 200
    and coalesce(char_length(name), 0) <= 200
    and coalesce(char_length(people), 0) <= 10
    and coalesce(char_length(date), 0) <= 20
    and (kind = 'subscribe' or coalesce(char_length(message), 0) > 0)
  );

-- Optional: get an email for every new row. Supabase has no built-in mailer;
-- the simplest route is Database Webhooks (Dashboard → Database → Webhooks)
-- pointing at a Zapier / Make / Resend endpoint, filtered on INSERT.
