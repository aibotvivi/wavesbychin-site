# Wavesbychin — sound healing site

Marketing site for Wavesbychin, Vivi's East London sound healing, energy healing and breathwork practice.
Static, no dependencies, no framework. One page template, one stylesheet, one script, plus a
small Node script that pre-renders a real HTML file per page (for search engines — see below).
Built from `~/Downloads/design_handoff_wavesbychin_site` (the design source of truth — tokens,
copy and interactions all come from its README and `Wavesbychin.dc.html`).

## Live

https://wavesbychin.com (since 2026-11-12) — GitHub Pages from the `main` branch root of
`aibotvivi/wavesbychin-site` (public; a private repo would take the site down on the Free
plan). Every push to `main` redeploys in about a minute. The old address
https://aibotvivi.github.io/wavesbychin-site/ redirects here.

**Domain:** registered at IONOS (bought 2026-11-12). The `CNAME` file in this repo tells Pages
which domain to serve — deleting it, or clearing the box in repo Settings → Pages, takes the
domain off and the github.io address back. DNS at IONOS: four `A` + four `AAAA` records on
`@` and on `www` pointing at GitHub Pages (185.199.108–111.153, 2606:50c0:8000–8003::153);
MX records are IONOS mail, leave them. **Order matters:** DNS must point at GitHub before the
domain is entered in Pages, because Pages starts redirecting the github.io address at once —
entering it first took the site down for a few minutes on 2026-11-12.

## Run it locally

```bash
./serve.sh          # http://localhost:8798
```

Use the server rather than `file://`: pages are folders (`offerings/index.html`), and only a
server turns `offerings/` into that file.

## After changing any copy — rebuild

```bash
node scripts/build-pages.mjs          # regenerates index.html, */index.html, sitemap.xml, robots.txt
node scripts/build-pages.mjs --check  # exits 1 if any of them is stale; run before pushing
```

Copy lives in `app.js`; the header, footer and `<head>` live in `template.html`. The build runs
`app.js`'s render functions in a sandbox and writes each page's HTML with its own `<title>`,
meta description, canonical URL and Open Graph tags, plus JSON-LD (`LocalBusiness` on the
home pages, `FAQPage` on the FAQ, breadcrumbs elsewhere). **Never edit a generated
`index.html` by hand** — the next build overwrites it.

You don't have to remember: `.github/workflows/build-pages.yml` runs the build on GitHub after
every push that touches `app.js`, `config.js`, `template.html` or the generated files, and
commits the regenerated pages as `github-actions[bot]` if anything changed (GitHub Pages then
redeploys). So an edit made in GitHub's web editor or by another AI tool is complete on its own.
Check a run under the repo's **Actions** tab. Pull before editing locally afterwards
(`git pull`), since the bot may have added a commit.

The canonical origin is `https://wavesbychin.com`, the default `ORIGIN` in the script (the
Action uses it too). Change it there if the domain ever changes.

## Files

| File | What it is |
|---|---|
| `template.html` | Shell for every page: `<head>`, sticky header, `<main id="app">`, footer, cookie banner |
| `index.html`, `*/index.html` | **Generated** pages, one per route (root = About) |
| `sitemap.xml`, `robots.txt` | **Generated** |
| `scripts/build-pages.mjs` | The generator (see above) |
| `styles.css` | Design tokens as CSS custom properties on `:root`, then one class per component |
| `app.js` | Page content, per-page titles/descriptions, form handling, header collapse |
| `config.js` | Supabase URL + anon key, GA measurement ID, Innerwave / Instagram / email links |
| `supabase/inquiries.sql` | Table + insert-only RLS policy for the forms — run once in the dashboard |
| `assets/` | Logo, cover photo, portrait, four past-event photos |
| `serve.sh` | Local preview on :8798 |

## Pages

Each page is a real URL. Until 2026-11-12 they were `#/` hash routes, which Google treats as
one page. Old `…/#/offerings` links still work: `app.js` redirects them to the new URL.

| Path | Page | In nav? |
|---|---|---|
| `./` (site root) | About me — hero, portrait, story, timeline, how I work | yes |
| `offerings/` | What I offer — four offering cards | yes |
| `events/` | What's on — newsletter box, past events, photo collage | yes |
| `faq/` | FAQ — five groups, single-open accordion | yes |
| `message/` | Send a message — general / corporate form (`?type=corporate` preselects corporate) | header button |
| `home/` | Home — banner, hero, Innerwave card, moon band | logo click |
| `privacy/` | Privacy notice | footer |
| `voice/` | Voice & Video — placeholders, `noindex`, not in the sitemap | not linked |
| `moon/` | Moon Phase Rituals — not built while `SHOW_MOON` is false | — |

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
**Alerts:** `supabase/inquiry-alerts.sql` adds an INSERT trigger that sends each new row to
Telegram via `pg_net`, with the bot token and chat id held in Supabase Vault (fill them in
inside the SQL editor only — this repo is public). It is capped at 10 alerts per ten
minutes and never blocks the insert. Run it once after `inquiries.sql`. The key in `config.js` is the **anon** key; never put `service_role` there.

Rows carry `kind` (`message` | `subscribe`), the form fields, `page` (the page it was
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
- Each page load sends one `page_view` with `page_path` like `/about`, `/offerings`,
  `/message` (unchanged from the hash-route era, so reports stay continuous). GA's own
  automatic page view is off.
- Custom events: `message_sent` / `message_failed` (with `inquiry_type`), `subscribe` /
  `subscribe_failed`.

Live since 2026-09-21: GA4 property **Wavesbychin** (UK time zone, GBP) in the same Google
account as the portfolio, web stream "Wavesbychin site" (stream id 15814154141), measurement
ID `G-E058XXVER6` in `config.js`. The stream's URL is a placeholder `wavesbychin.com` — edit
it in Admin → Data streams once the real domain exists; it does not affect collection.
Verified: collect hits carry `gcs=G100` (denied, cookieless) before Accept and `G101` after.
Expect GA to under-count — it only stores people who pressed Accept.

## Cross-domain tracking with InnerWaves — blocked on a real domain

Wavesbychin and InnerWaves are two separate GA4 data streams on the same "Wavesbychin"
property (see `~/taroscope-app` for InnerWaves' own GA setup, added 2026-09-23). Today
they are tracked as unrelated traffic: a visitor who clicks through from here to
InnerWaves shows up as two disconnected sessions, not one journey, and the Innerwave link
below points at the GitHub repo, not at InnerWaves itself — nobody can actually click
through to the live app yet.

Fixing this needs, in order:
1. Real domains for both sites (neither is decided as of 2026-09-23 — this file's own
   `wavesbychin.com` GA placeholder is not confirmed, and InnerWaves' planned subdomain
   name isn't chosen either; see `~/taroscope-app/docs/hosting.md` §5).
2. `INNERWAVE_URL` in `config.js` repointed from the GitHub repo to InnerWaves' real URL.
3. Both domains added to **each** stream's Admin → Data Streams → Configure tag settings
   → Configure your domains, so gtag auto-decorates links between them with `_gl`.

Configuring step 3 now, before 1–2 exist, would be inert — the current Innerwave link
doesn't point at either real host, so no decoration would ever fire. Do this at the same
cutover as the InnerWaves `docs/hosting.md` checklist, not before.

## Still outstanding (from the handoff)

- No prices are published — the copy says rates are shared on inquiry.
- Cacao ceremony FAQ answer and corporate lead time still need Vivi's final wording.
- Video embeds and audio players on Voice & Video are placeholders.
- Home banner and Voice photo reuse existing shots until dedicated ones exist.
