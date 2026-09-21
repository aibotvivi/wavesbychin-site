# Wavesbychin — sound healing site

Marketing site for Wavesbychin, Vivi's London sound healing, reiki, cacao and breathwork practice.
Static: one HTML shell, one stylesheet, one script. No build step, no dependencies, no framework.
Built from `~/Downloads/design_handoff_wavesbychin_site` (the design source of truth — tokens,
copy and interactions all come from its README and `Wavesbychin.dc.html`).

## Live

https://aibotvivi.github.io/wavesbychin-site/ — GitHub Pages from the `main` branch root of
`aibotvivi/wavesbychin-site` (public; a private repo would take the site down on the Free
plan). Every push to `main` redeploys in about a minute.

## Run it locally

```bash
./serve.sh          # http://localhost:8798
```

Or open `index.html` directly — everything is relative, so it works from `file://` too
(the Google Fonts request is the only network call).

## Files

| File | What it is |
|---|---|
| `index.html` | Shell: `<head>`, sticky header, empty `<main id="app">`, footer, cookie banner |
| `styles.css` | Design tokens as CSS custom properties on `:root`, then one class per component |
| `app.js` | Page content (timeline, FAQ, moon phases), hash router, form handling, header collapse |
| `config.js` | Supabase URL + anon key, GA measurement ID, Innerwave / Instagram / email links |
| `supabase/inquiries.sql` | Table + insert-only RLS policy for the forms — run once in the dashboard |
| `assets/` | Logo, cover photo, portrait, four past-event photos |
| `serve.sh` | Local preview on :8798 |

## Pages

Routes live in the URL hash so every page is linkable and the back button works.

| Hash | Page | In nav? |
|---|---|---|
| `#/about` (default) | About me — hero, portrait, story, timeline, how I work | yes |
| `#/offerings` | What I offer — four offering cards | yes |
| `#/events` | What's on — newsletter box, past events, photo collage | yes |
| `#/faq` | FAQ — five groups, single-open accordion | yes |
| `#/message` | Send a message — general / corporate form | header button |
| `#/home` | Home — banner, hero, Innerwave card, moon band | logo click |
| `#/moon` | Moon Phase Rituals — tonight's phase + eight ritual cards | from Home / Offerings |
| `#/voice` | Voice & Video — embed and audio placeholders | from Home / FAQ |

## Changing things

- **Copy** for the timeline, FAQ and moon rituals is data at the top of `app.js`; everything
  else is in the page render functions just below it.
- **Photos**: the `PHOTOS` map at the top of `app.js`. Each slot takes `src`, `alt` and an
  optional `object-position`. The Home banner, Voice photo and both moon bands have no
  dedicated photo yet — banner and voice reuse existing shots, the moon bands are a CSS
  night sky. Swap them there when there are real photos.
- **Links**: `config.js`. The Innerwave link currently points at the GitHub repo.
- **Colours / type / radii**: `:root` in `styles.css`.

## Forms → Supabase

The message form and the newsletter box both call `save(payload)` in `app.js`, which POSTs
JSON to `${SUPABASE_URL}/rest/v1/inquiries` with the public anon key. Success is shown
**only when Supabase accepts the row**; otherwise the form stays filled and shows a
"didn't go through — email me directly" line. With the key blank every submit takes that
path, so nothing is silently lost.

Live since 2026-09-21 on the project the portfolio also uses (shown as "Spliteasy" in the
dashboard, ref `wkkyoszrdontvziehaku`). `supabase/inquiries.sql` was run once there; it
creates the table and an insert-only RLS policy with shape checks (`source`, `kind`, email
pattern, length caps). No SELECT policy: the browser can write, never read — verified with
the anon key (read returns `[]`, an off-shape insert gets 401).

Read submissions at https://supabase.com/dashboard/project/wkkyoszrdontvziehaku/editor
(Table editor → `inquiries`). Rows 1–2 are the build's test submissions, safe to delete.
For an email on each new row, add a Database Webhook on INSERT pointing at Zapier / Make /
Resend — not built. The key in `config.js` is the **anon** key; never put `service_role` there.

Rows carry `kind` (`message` | `subscribe`), the form fields, `page` (the hash route it was
sent from) and `source = 'wavesbychin-site'`.

## Analytics → Google Analytics 4

Same pattern as `~/maria-site/analytics.js`, written up there in full. In short:

- `index.html` declares Consent Mode v2 defaults (`analytics_storage: denied`, ads all
  denied) in `<head>`, **before** the tag.
- `app.js` loads `gtag.js` for every visitor when `GA_MEASUREMENT_ID` is set, with
  `send_page_view: false` and `anonymize_ip: true`. GA starts cookieless and stores nothing.
- The cookie banner appears only when there is a measurement ID (asking consent for nothing
  would be theatre). **Accept** → `consent update analytics_storage: granted`; **Decline**
  leaves it denied. The choice lives in `localStorage` under `wbc-cookie` and is re-applied
  on every visit.
- Because routing is hash-based, `navigate()` sends a `page_view` per route with
  `page_path` like `/about`, `/offerings`, `/message`. GA's own automatic page view is off.
- Custom events: `message_sent` / `message_failed` (with `inquiry_type`), `subscribe` /
  `subscribe_failed`.

Live since 2026-09-21: GA4 property **Wavesbychin** (UK time zone, GBP) in the same Google
account as the portfolio, web stream "Wavesbychin site" (stream id 15814154141), measurement
ID `G-E058XXVER6` in `config.js`. The stream's URL is a placeholder `wavesbychin.com` — edit
it in Admin → Data streams once the real domain exists; it does not affect collection.
Verified: collect hits carry `gcs=G100` (denied, cookieless) before Accept and `G101` after.
Expect GA to under-count — it only stores people who pressed Accept.

## Still outstanding (from the handoff)

- No prices are published — the copy says rates are shared on inquiry.
- Cacao ceremony FAQ answer and corporate lead time still need Vivi's final wording.
- Video embeds and audio players on Voice & Video are placeholders.
- Home banner and Voice photo reuse existing shots until dedicated ones exist.
