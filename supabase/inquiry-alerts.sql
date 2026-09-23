-- Telegram alert for every new inquiry.
--
-- Without this, a row lands in `inquiries` and waits until someone opens the table
-- editor. This fires inside the database on INSERT, so it works when every
-- machine of ours is asleep, and it adds no endpoint and no key to the page.
--
-- Run once in the SQL editor, AFTER inquiries.sql:
--   https://supabase.com/dashboard/project/wkkyoszrdontvziehaku/sql/new
--
-- BEFORE RUNNING: fill in the two values in step 1 in the editor only. This repo is
-- PUBLIC (GitHub Pages needs it to be) — never commit a real bot token to this file.
-- Re-running the whole file is safe; step 1 replaces the stored values.

-- 1. The bot token and chat id, stored encrypted in Supabase Vault, not in code.
--    Token: from @BotFather. Chat id: your own chat with that bot.
do $$
declare
  tok  text := '<PASTE BOT TOKEN HERE>';
  chat text := '<PASTE CHAT ID HERE>';
begin
  if tok like '<%' or chat like '<%' then
    raise exception 'fill in the bot token and chat id in step 1 first';
  end if;
  delete from vault.secrets where name in ('wbc_telegram_token', 'wbc_telegram_chat');
  perform vault.create_secret(tok,  'wbc_telegram_token');
  perform vault.create_secret(chat, 'wbc_telegram_chat');
end $$;

-- 2. pg_net makes the HTTP call asynchronously, after the insert commits.
create extension if not exists pg_net with schema extensions;

-- 3. The trigger function.
--    SECURITY DEFINER because the inserting role is `anon`, which cannot read the
--    vault; search_path is pinned so the definer rights cannot be hijacked.
--    It never raises: an alert failing must not lose the inquiry itself.
create or replace function public.notify_inquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tok    text;
  chat   text;
  recent int;
  body   text;
begin
  -- The table takes anonymous inserts, so cap the alerts: past 10 in ten minutes,
  -- stay quiet (the rows are still saved) rather than flood the chat.
  select count(*) into recent from public.inquiries
   where created_at > now() - interval '10 minutes';
  if recent > 10 then
    return new;
  end if;

  select decrypted_secret into tok  from vault.decrypted_secrets where name = 'wbc_telegram_token';
  select decrypted_secret into chat from vault.decrypted_secrets where name = 'wbc_telegram_chat';
  if tok is null or chat is null then
    return new;
  end if;

  -- Plain text, no parse_mode: the fields are visitor-typed, so nothing in them
  -- can be interpreted as markup.
  body := concat_ws(e'\n',
    'Wavesbychin — new ' || case when new.kind = 'subscribe' then 'newsletter sign-up'
                                 else coalesce(new.type, 'general') || ' message' end,
    'From: ' || coalesce(nullif(new.name, ''), '(no name)') || ' <' || new.email || '>',
    case when coalesce(new.company, '') <> '' then 'Company: ' || new.company end,
    case when coalesce(new.people,  '') <> '' then 'People: '  || new.people  end,
    case when coalesce(new.date,    '') <> '' then 'Date: '    || new.date    end,
    case when coalesce(new.format,  '') <> '' then 'Format: '  || new.format  end,
    case when coalesce(new.message, '') <> '' then e'\n' || left(new.message, 1500) end
  );

  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    body    := jsonb_build_object('chat_id', chat, 'text', body,
                                  'disable_web_page_preview', true),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.notify_inquiry() from public, anon, authenticated;

drop trigger if exists inquiries_notify on public.inquiries;
create trigger inquiries_notify
  after insert on public.inquiries
  for each row execute function public.notify_inquiry();

-- To test: send the site's message form once. If nothing arrives within a minute,
--   select status_code, content from net._http_response order by created desc limit 5;
-- shows Telegram's reply (401 = wrong token, 400 "chat not found" = wrong chat id,
-- or you have not pressed Start in a chat with the bot).
-- To turn it off: drop trigger inquiries_notify on public.inquiries;
