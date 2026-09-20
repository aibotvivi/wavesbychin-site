/* Wavesbychin — single-page site. No build step, no dependencies.
   Routes live in the URL hash (#/about, #/offerings, …); "about" is the default landing page. */
(function () {
  "use strict";

  var CFG = window.WBC_CONFIG || {};
  var INNERWAVE = CFG.INNERWAVE_URL || "#";
  var EMAIL = CFG.EMAIL || "wavesbychin@gmail.com";

  // Photo slots. Swap any path here to change the picture on the site.
  var PHOTOS = {
    banner: { src: "assets/offer-cover.jpg", alt: "Singing bowls laid out on a kilim rug", pos: "center 45%" },
    portrait: { src: "assets/about-me.jpg", alt: "Vivi playing singing bowls in a session room", pos: "center 62%" },
    offerCover: { src: "assets/offer-cover.jpg", alt: "Singing bowls laid out on a kilim rug", pos: "center 45%" },
    voice: { src: "assets/past-2.jpg", alt: "Playing bowls on a patterned rug", pos: "center 40%" },
    past: [
      { src: "assets/past-1.jpg", alt: "Singing bowls and a candle on a white cloth" },
      { src: "assets/past-2.jpg", alt: "Playing bowls on a patterned rug" },
      { src: "assets/past-3.jpg", alt: "Session set up in a bright room" },
      { src: "assets/past-4.jpg", alt: "An oracle card held up in a session room" }
    ]
  };

  var ROUTES = { home: "home", about: "about", offerings: "offerings", moon: "moon", voice: "voice", events: "events", message: "corporate", corporate: "corporate", faq: "faq" };
  var PATHS = { home: "home", about: "about", offerings: "offerings", moon: "moon", voice: "voice", events: "events", corporate: "message", faq: "faq" };

  var emptyForm = function () {
    return { type: "general", company: "", name: "", email: "", people: "", date: "", format: "workshop", message: "" };
  };

  var state = {
    page: "about",
    faq: 1,        // open FAQ index, 0 = none (first question open on arrival)
    tl: 0,         // open timeline index, -1 = none (first step open on arrival)
    form: emptyForm(),
    sent: false,
    sending: false,
    sendError: false,
    subEmail: "",
    subLabel: "Join",
    subError: false,
    headerFull: true
  };

  // ---------- content ----------

  var TIMELINE = [
    { year: "Feb 2023", title: "Sound Healing, Nepal 🇳🇵", detail: "Certified in Sound Healing in Nepal." },
    { year: "Feb 2024", title: "Reiki Level 2, London 🇬🇧", detail: "Certified in Level 2 Reiki in London." },
    { year: "Dec 2025", title: "Cacao ceremony 🇧🇷", detail: "Certified in cacao ceremony by a Brazilian instructor." },
    { year: "2026 — ongoing", title: "BaZi 🇭🇰", detail: "Currently studying BaZi." },
    { year: "2026 — ongoing", title: "Pranic healing 🇮🇳", detail: "Currently studying Pranic healing." }
  ];

  var FAQ = [
    { group: "Before you book", items: [
      { q: "What should I expect in a session?", a: "Every session is a little different, but most begin with settling in — some breathwork or a short grounding moment — before moving into sound with Tibetan singing bowls. I often work close to you during the sound healing portion, moving the bowls near your body so you feel the vibration as well as hear it. Some people fall asleep, some feel a deep sense of calm, others feel very little the first time — all of that is normal." },
      { q: "Is this a substitute for medical or mental health treatment?", a: "No. Sound healing, reiki, and cacao ceremony are wellness practices, not medical treatment. If you have a specific health concern, please continue working with your doctor or therapist alongside any sessions with me." },
      { q: "Are there any health conditions I should mention before booking?", a: "Yes — please let me know in advance if you're pregnant, have epilepsy, have a pacemaker or other implanted medical device, or have had recent surgery, so we can adjust the session appropriately." }
    ] },
    { group: "During a session", items: [
      { q: "You mentioned working close to clients during sound healing — what does that involve?", a: "I move the bowls near your body during parts of the session so you can feel the vibration, not just hear it. If you'd prefer more distance, just let me know beforehand — I'm always happy to adjust." },
      { q: "What's included in a cacao ceremony?", a: "Cacao ceremonies are a slower, more ceremonial experience — often paired with intention-setting, breathwork, or sound." },
      { q: "Can I request specific elements — reiki, chanting, breathwork?", a: "Yes. I shape each session around the group and the time we have, so let me know if there's something you're drawn to or want to include." }
    ] },
    { group: "Corporate", items: [
      { q: "Do you offer sessions for teams or offsites?", a: "Yes — I run sound healing sessions for corporate wellness days, offsites, and team wellbeing weeks. Sessions can be adapted for group size and available space." },
      { q: "Do you travel to our office/venue?", a: "Yes. I travel to offices and venues — travel is quoted based on distance, with a travel fee added for anything outside central London." }
    ] },
    { group: "Booking & practical", items: [
      { q: "What's your cancellation policy?", a: "Sessions aren't cancelled, but they can be rescheduled. Let me know as early as you can and we'll find another date that works." },
      { q: "What should I wear or bring?", a: "Comfortable, loose clothing you can relax in. A mat, cushion, or blanket if you have one — otherwise I'll have what you need." }
    ] },
    { group: "Credentials", items: [
      { q: "What's your training background?", a: "I'm a certified sound healing practitioner (trained in Nepal), a Reiki Level 2 practitioner (trained in London), and certified in cacao ceremony facilitation (London/Brazil)." }
    ] }
  ];

  var PHASES = [
    { name: "New Moon", intent: "Setting down", disc: "#E9E8E3", body: "Low gong, long silences, the darkest room of the cycle. We name one thing we are beginning and leave it unspoken after that." },
    { name: "Waxing Crescent", intent: "First movement", disc: "linear-gradient(100deg,#E9E8E3 0 76%,#131310 76% 100%)", body: "Bowls only, played light and quick. A short session, forty-five minutes, usually at the start of a working week." },
    { name: "First Quarter", intent: "Friction", disc: "linear-gradient(90deg,#E9E8E3 0 50%,#131310 50% 100%)", body: "Two instruments deliberately at odds, resolved slowly. The most audible session of the eight, and the one people remember." },
    { name: "Waxing Gibbous", intent: "Tending", disc: "linear-gradient(80deg,#E9E8E3 0 26%,#131310 26% 100%)", body: "Voice takes the lead — sustained tones, few instruments. Often paired with the Voice &amp; Breath circle for those who want to join in." },
    { name: "Full Moon", intent: "Full room", full: true, body: "The largest gathering of the month. Every instrument, ninety minutes, and the one session that regularly sells out. Booking opens ten days ahead." },
    { name: "Waning Gibbous", intent: "Telling", disc: "linear-gradient(280deg,#E9E8E3 0 26%,#131310 26% 100%)", body: "Sound with a spoken thread running through it — a short reading, then an hour of quiet. Small room, twelve people at most." },
    { name: "Last Quarter", intent: "Putting down", disc: "linear-gradient(270deg,#E9E8E3 0 50%,#131310 50% 100%)", body: "Descending tones, nothing added in the second half. The session ends with a single bowl left to fade on its own." },
    { name: "Waning Crescent", intent: "Rest", disc: "linear-gradient(260deg,#E9E8E3 0 76%,#131310 76% 100%)", body: "Dawn session, forty minutes, no framing and no closing circle. You arrive, you lie down, you leave when you are ready." }
  ];

  // ---------- helpers ----------

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function photo(p, ratio, extra) {
    return '<div class="photo photo--' + ratio + (extra ? " " + extra : "") + '"><img src="' + p.src + '" alt="' + esc(p.alt) + '"' +
      (p.pos ? ' style="object-position:' + p.pos + '"' : "") + ' loading="lazy"></div>';
  }

  function moon() {
    var names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
    var syn = 29.530588853;
    var days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    var age = ((days % syn) + syn) % syn;
    var idx = Math.floor((age / syn) * 8 + 0.5) % 8;
    var toFull = (syn / 2 - age + syn) % syn;
    var next = toFull < 0.6 ? "full tonight" : "full in " + Math.round(toFull) + " days";
    return { name: names[idx], next: next };
  }

  function href(page) { return "#/" + PATHS[page]; }

  // ---------- pages ----------

  function renderHome() {
    var m = moon();
    return (
      photo(PHOTOS.banner, "169") +
      '<section class="panel panel--hero">' +
        '<h1 class="h1 h1--home">Somewhere to put the noise down.</h1>' +
        '<p style="margin:0 0 20px;font-family:var(--serif);font-weight:700;font-size:clamp(17px,2.4vw,21px);color:var(--ink);line-height:normal">Gong · Singing bowls · Voice</p>' +
        '<p style="margin:0 0 26px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:var(--body);font-weight:500">Live sound, held in person</p>' +
        '<p class="lead" style="margin-bottom:30px">An hour of sound where nothing is asked of you. You lie down, you stay warm, and the room does the rest. Offered to groups, to teams, and to one person at a time.</p>' +
        '<div class="cta-stack cta-stack--rule">' +
          '<a class="btn btn--block" href="' + href("offerings") + '" data-nav="offerings">See the offerings</a>' +
          '<a class="btn btn--outline btn--block" href="' + href("voice") + '" data-nav="voice">Listen first</a>' +
        '</div>' +
      '</section>' +
      '<section class="panel panel--wide">' +
        '<h2 class="h2 h2--lg h2--tight">Alongside the sound</h2>' +
        '<p class="lead lead--13" style="text-align:center;margin-bottom:26px">A companion project, open whether or not you ever come to a session.</p>' +
        '<div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">' +
          '<a class="card card--link" href="' + INNERWAVE + '" target="_blank" rel="noopener">' +
            '<span class="card__kicker">Innerwave</span>' +
            '<span class="card__title">Tarot &amp; dream reading</span>' +
            '<span class="card__body">A separate project for tarot spreads and working through dreams in your own time.</span>' +
            '<span class="card__cta">Visit Innerwave ↗</span>' +
          '</a>' +
        '</div>' +
      '</section>' +
      '<section class="panel panel--wide">' +
        '<h2 class="h2 h2--lg" style="margin-bottom:26px">What a session is</h2>' +
        '<div class="stack">' +
          '<div class="card"><h3>In the room</h3><p>Instruments played live — gong, Himalayan and crystal bowls, chimes, voice. You lie on a mat under a blanket and listen. There is nothing to learn beforehand and nothing to perform.</p></div>' +
          '<div class="card"><h3>Who comes</h3><p>People who meditate daily and people who never have. Teams at the end of a long quarter. Couples, birthdays, farewells. First-timers are the majority, most weeks.</p></div>' +
          '<div class="card"><h3>How to begin</h3><p>Come to a public session, or bring sound to your own room — an office, a studio, a living room, a retreat.</p></div>' +
        '</div>' +
        '<p class="quote">You\'re not being asked to believe anything.<br>You\'re being asked to lie down and listen.</p>' +
      '</section>' +
      '<section class="photo photo--167 photo--band"><div class="sky"></div>' +
        '<div class="band__overlay"><p>Tonight: ' + m.name + '</p></div>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--lg h2--band">Eight rituals, one lunar month</h2>' +
        '<p class="lead lead--band">The Moon Phase Rituals follow the month rather than the calendar — eight sessions, each one shaped by where the light is.</p>' +
        '<a class="btn btn--outline btn--wide" href="' + href("moon") + '" data-nav="moon">See the cycle</a>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--lg h2--band">Sound for teams</h2>' +
        '<p class="lead lead--band">A session runs 45 to 90 minutes and needs only floor space and a door that closes. Away days, launch weeks, wellbeing programmes, or an ordinary Thursday afternoon.</p>' +
        '<a class="btn btn--wide btn--max" href="' + href("corporate") + '" data-nav="corporate">Make an inquiry</a>' +
      '</section>'
    );
  }

  function renderAbout() {
    var rows = TIMELINE.map(function (t, i) {
      return '<div class="tl__row' + (state.tl === i ? " is-open" : "") + '">' +
        '<div class="tl__dotwrap"><span class="tl__dot"></span></div>' +
        '<button class="tl__btn" type="button" data-action="tl" data-i="' + i + '" aria-expanded="' + (state.tl === i) + '">' +
          '<span class="tl__year">' + t.year + '</span>' +
          '<span class="tl__title">' + t.title + '</span>' +
          '<span class="tl__detail">' + t.detail + '</span>' +
        '</button>' +
      '</div>';
    }).join("");

    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">About me</p>' +
        '<h1 class="h1">Hi, I\'m Vivi.</h1>' +
        '<p class="lead lead--15">I\'m Vivi — a certified sound healing practitioner in Nepal and Reiki Level 2 practitioner based in London.</p>' +
      '</section>' +
      photo(PHOTOS.portrait, "34") +
      '<section class="panel panel--wide panel--story story">' +
        '<h2 class="h2 h2--story">My story</h2>' +
        '<p>My path here started with loss. When my grandmother passed away, I travelled to Nepal on my own — and that journey became the beginning of everything. It led me into <strong>sound healing</strong>, and into <strong>reiki</strong> as a way of understanding my own healing.</p>' +
        '<p>Since then, the practice has kept growing. I\'m also certified in <strong>cacao ceremony</strong> facilitation, and I\'ve been studying <strong>BaZi</strong> on the side — something that\'s quietly reshaped how I see myself and the people I work with.</p>' +
        '<p><strong>Wavesbychin</strong> is where all of that comes together: sound, <strong>breathwork</strong>, ceremony, and a genuine belief that stillness is something we can return to, not something we have to chase.</p>' +
      '</section>' +
      '<section class="panel panel--wide">' +
        '<h2 class="h2 h2--path">My path</h2>' +
        '<div class="tl"><span class="tl__rule"></span><div class="tl__list">' + rows + '</div></div>' +
      '</section>' +
      '<section class="panel">' +
        '<h2 class="h2">How I work</h2>' +
        '<div class="stack">' +
          '<div class="card"><h3>Close, Intentional Sound</h3><p>I work primarily with Tibetan singing bowls, and I bring the sound close — moving near each person during a session so the frequency isn\'t just heard, but felt. It\'s a more intimate way of working, and it\'s central to how I practice.</p></div>' +
          '<div class="card"><h3>Shaped Around You</h3><p>No two sessions look exactly the same. Depending on the group, the time we have, and the intention behind the session, I draw from a wider toolkit — affirmation, chanting, breathwork, meditation, reiki, cacao, and tea sharing — weaving in what serves the moment rather than following a fixed format.</p></div>' +
          '<div class="card"><h3>What I don\'t claim</h3><p>This is live sound and rest. It is not medical care, it makes no health claims, and it does not replace advice or treatment from a professional.</p></div>' +
        '</div>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--cta">Want to ask something first?</h2>' +
        '<p class="lead lead--14 lead--cta">Write with a date, a room, or just a question. Replies come from ' + EMAIL + ' within two working days.</p>' +
        '<a class="btn btn--15" href="' + href("corporate") + '" data-nav="corporate">Send a message</a>' +
      '</section>'
    );
  }

  function renderOfferings() {
    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">What I offer</p>' +
        '<h1 class="h1">A different theme each time.</h1>' +
        '<p class="lead">Every offering is the same instruments held differently. Rates are shared on inquiry and scale with room, travel and group size.</p>' +
      '</section>' +
      photo(PHOTOS.offerCover, "43") +
      '<section class="panel panel--stack">' +
        '<article class="card offer"><p class="offer__meta">75 minutes · up to 30 people</p><h2>Group Sound Baths</h2><p>The public session. Doors open fifteen minutes early, the room is dim, and you choose a mat. Roughly an hour of continuous sound, then silence, then tea if the venue allows it.</p></article>' +
        '<article class="card offer"><p class="offer__meta">60 minutes · one person</p><h2>1:1 Sound Healing Sessions</h2><p>Tibetan singing bowl sessions tailored to you, in person or at your space. A short conversation first, then sound played close — bowls placed on and around the body, voice used sparingly. Suited to people who find group rooms distracting.</p></article>' +
        '<article class="card offer"><p class="offer__meta">45–90 minutes · teams</p><h2>Corporate Wellness Sessions</h2><p>Sound healing brought into offsites, wellness weeks and team days. A brief framing of what sound is and isn\'t, the session itself, and space for questions afterwards. Mats and instruments travel with me.</p>' +
          '<button class="textbtn" type="button" data-action="corporate-inquiry">Corporate inquiries →</button></article>' +
        '<article class="card offer"><p class="offer__meta">By arrangement</p><h2>Ceremony &amp; private events</h2><p>Weddings, namings, memorials, milestone birthdays, retreat closings. Sound written around the shape of your day, agreed with you beforehand rather than improvised at you.</p></article>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<p class="lead lead--muted lead--22">Sessions are described here in terms of what happens in the room. They are not treatment, and they are not a substitute for care from a professional.</p>' +
        '<a class="btn btn--outline btn--wide" href="' + href("moon") + '" data-nav="moon">Moon phase rituals</a>' +
      '</section>'
    );
  }

  function renderMoon() {
    var m = moon();
    var cards = PHASES.map(function (p) {
      return '<article class="card phase' + (p.full ? " phase--full" : "") + '">' +
        '<div class="phase__disc"' + (p.disc ? ' style="background:' + p.disc + '"' : "") + '></div>' +
        '<h3>' + p.name + '</h3><p class="phase__intent">' + p.intent + '</p><p>' + p.body + '</p>' +
      '</article>';
    }).join("");

    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">Moon Phase Rituals</p>' +
        '<h1 class="h1">Eight sessions, one lunar month.</h1>' +
        '<p class="lead lead--band">The same instruments, tuned to a different intention each time. Come to one, or follow the whole cycle — roughly twenty-nine days from dark to dark.</p>' +
        '<div class="moon-now"><span class="moon-now__label">Tonight</span><span class="moon-now__name">' + m.name + '</span><span class="moon-now__next">' + m.next + '</span></div>' +
      '</section>' +
      '<div class="photo photo--167"><div class="sky"></div></div>' +
      '<section class="panel panel--grid">' + cards + '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--cta">Innerwave</h2>' +
        '<p class="lead lead--13 lead--cta">A companion project sits alongside the rituals — Innerwave, for tarot and dream reading.</p>' +
        '<div class="cta-stack"><a class="btn btn--outline btn--block" style="padding:15px" href="' + INNERWAVE + '" target="_blank" rel="noopener">Innerwave ↗</a></div>' +
      '</section>'
    );
  }

  function renderVoice() {
    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">Voice &amp; Video</p>' +
        '<h1 class="h1">Hear the room before you book it.</h1>' +
        '<p class="lead">Recordings are made in the rooms where sessions happen, on two microphones, unedited. Headphones help. Volume low.</p>' +
      '</section>' +
      photo(PHOTOS.voice, "167") +
      '<section class="panel media-grid">' +
        '<figure><div class="embed">Video embed — full moon session, 2 min</div><figcaption>A full session, cut to two minutes. Filmed at the March full moon gathering.</figcaption></figure>' +
        '<figure><div class="embed">Video embed — how a gong is played</div><figcaption>Close on the gong: where it is struck, and why the sound keeps moving after the hand leaves.</figcaption></figure>' +
      '</section>' +
      '<section class="panel">' +
        '<h2 class="h2 h2--lg">Listening pieces</h2>' +
        '<div class="stack">' +
          '<div class="card track"><div><h3>Long Gong</h3><p class="track__meta">11:24 · single instrument</p></div><div class="track__player">Audio player — drop file or embed</div></div>' +
          '<div class="card track"><div><h3>Bowls, Seven</h3><p class="track__meta">18:02 · Himalayan bowls</p></div><div class="track__player">Audio player — drop file or embed</div></div>' +
          '<div class="card track"><div><h3>Voice, Unaccompanied</h3><p class="track__meta">6:40 · voice only</p></div><div class="track__player">Audio player — drop file or embed</div></div>' +
        '</div>' +
      '</section>'
    );
  }

  function renderEvents() {
    var tiles = PHOTOS.past.map(function (p) {
      return '<div class="collage__tile"><img src="' + p.src + '" alt="' + esc(p.alt) + '" loading="lazy"></div>';
    }).join("");

    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow" style="margin-bottom:0">What\'s on</p>' +
        '<p class="lead lead--14" style="margin-top:14px">Upcoming sessions and past events.</p>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--md h2--tight">Upcoming events</h2>' +
        '<p class="lead lead--13 lead--cta">Leave your email and I\'ll send the next dates as they open.</p>' +
        '<form class="form form--sub" data-form="subscribe">' +
          '<input class="ctl" name="email" type="email" required placeholder="you@email.com" value="' + esc(state.subEmail) + '">' +
          '<button class="btn" type="submit" style="padding:15px 24px"' + (state.subLabel === "Adding…" ? " disabled" : "") + '>' + state.subLabel + '</button>' +
          (state.subError ? '<p class="form__note form__note--error">That didn\'t go through — email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> and I\'ll add you by hand.</p>' : "") +
        '</form>' +
      '</section>' +
      '<section class="panel">' +
        '<h2 class="h2 h2--lg">Past events</h2>' +
        '<div class="stack">' +
          '<article class="card event"><div class="event__date"><span class="event__day">20</span><span class="event__month">Nov</span></div><div><h3>Family constellations + sound healing</h3><p>Collaboration with Soul Home @soulhome.london</p></div></article>' +
          '<article class="card event"><div class="event__date"><span class="event__day">29</span><span class="event__month">Aug</span></div><div><h3>Reiki + sound healing</h3><p></p></div></article>' +
        '</div>' +
        '<div class="collage">' + tiles + '</div>' +
      '</section>'
    );
  }

  function renderCorporate() {
    var f = state.form;
    var corp = f.type === "corporate";
    var body;

    if (state.sent) {
      body = '<div class="sent">' +
        '<h3>Received, thank you.</h3>' +
        '<p>A reply will come within two working days, from ' + EMAIL + '. If it\'s urgent, say so in a second note and I\'ll move it up.</p>' +
        '<button class="btn btn--outline" type="button" data-action="reset-form">Send another</button>' +
      '</div>';
    } else {
      body = '<form class="form" data-form="message">' +
        '<select class="ctl" name="type" aria-label="Type of inquiry">' +
          '<option value="general"' + (corp ? "" : " selected") + '>General inquiry</option>' +
          '<option value="corporate"' + (corp ? " selected" : "") + '>Corporate inquiry</option>' +
        '</select>' +
        (corp ? '<input class="ctl" name="company" placeholder="Company (optional)" value="' + esc(f.company) + '">' : "") +
        '<input class="ctl" name="name" placeholder="Your name (optional)" autocomplete="name" value="' + esc(f.name) + '">' +
        '<input class="ctl" name="email" type="email" required placeholder="Email *" autocomplete="email" value="' + esc(f.email) + '">' +
        (corp ?
          '<div class="form--2up">' +
            '<input class="ctl" name="people" type="number" min="1" placeholder="How many people (optional)" value="' + esc(f.people) + '">' +
            '<input class="ctl" name="date" type="date" aria-label="Date" value="' + esc(f.date) + '">' +
          '</div>' +
          '<select class="ctl" name="format" aria-label="Format">' +
            '<option value="workshop"' + (f.format === "workshop" ? " selected" : "") + '>Workshop, 45–90 min</option>' +
            '<option value="series"' + (f.format === "series" ? " selected" : "") + '>A series across a quarter</option>' +
            '<option value="awayday"' + (f.format === "awayday" ? " selected" : "") + '>Away day or offsite</option>' +
            '<option value="unsure"' + (f.format === "unsure" ? " selected" : "") + '>Not sure yet</option>' +
          '</select>'
        : "") +
        '<textarea class="ctl" name="message" rows="4" required placeholder="Your message * — the space, the date, or just a question.">' + esc(f.message) + '</textarea>' +
        '<button class="btn" type="submit"' + (state.sending ? " disabled" : "") + '>' + (state.sending ? "Sending…" : "Send message") + '</button>' +
        (state.sendError ? '<p class="form__note form__note--error">That didn\'t go through. Please email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> directly — your message is still in the box above.</p>' : "") +
        '<p class="form__note">* required — everything else is optional.</p>' +
        '<p class="form__alt">Or write directly: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>' +
      '</form>';
    }

    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">Send a message</p>' +
        '<h1 class="h1">Ask me anything.</h1>' +
        '<p class="lead">Whether it is a team booking, a private ceremony or a single question about a session — write here. I reply within two working days.</p>' +
      '</section>' +
      '<section class="panel panel--wide">' +
        '<h2 class="h2 h2--md h2--form">Send a message</h2>' + body +
      '</section>' +
      '<section class="panel">' +
        '<h2 class="h2 h2--lg">How it works</h2>' +
        '<div class="stack">' +
          '<div class="card"><h3>What arrives with me</h3><p>The instruments, and a short introduction for people who have never done this. Please bring your own mat, blanket and anything else you need to lie down comfortably. Setup takes thirty minutes, pack-down twenty.</p></div>' +
          '<div class="card"><h3>What the room needs</h3><p>Floor space of roughly two square metres per person, lighting that can be lowered, and a door that closes. Carpet is a bonus, not a requirement.</p></div>' +
          '<div class="card"><h3>How it\'s described to your team</h3><p>As an hour of listening. Attendance is always optional, no one is asked to speak, and the session makes no claims about health or performance.</p></div>' +
        '</div>' +
      '</section>' +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--cta">Questions before you ask internally?</h2>' +
        '<p class="lead lead--13 lead--cta">Logistics, accessibility, what to tell people who are unsure — all answered on the FAQ page.</p>' +
        '<a class="btn btn--outline btn--wide" href="' + href("faq") + '" data-nav="faq">Read the FAQ</a>' +
      '</section>'
    );
  }

  function renderFaq() {
    var n = 0;
    var groups = FAQ.map(function (g) {
      var items = g.items.map(function (it) {
        n += 1;
        var open = state.faq === n;
        return '<div class="card faq' + (open ? " is-open" : "") + '">' +
          '<button class="faq__btn" type="button" data-action="faq" data-i="' + n + '" aria-expanded="' + open + '">' +
            '<span class="faq__q">' + it.q + '</span><span class="faq__sign" aria-hidden="true">' + (open ? "–" : "+") + '</span>' +
          '</button>' +
          '<p class="faq__a">' + it.a + '</p>' +
        '</div>';
      }).join("");
      return '<section class="panel"><h2 class="h2 h2--faq">' + g.group + '</h2><div class="stack stack--12">' + items + '</div></section>';
    }).join("");

    return (
      '<section class="panel panel--hero">' +
        '<p class="eyebrow">FAQ</p>' +
        '<h1 class="h1">Questions you might have.</h1>' +
        '<p class="lead">If yours isn\'t here, write to <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> and it will be answered directly.</p>' +
      '</section>' +
      groups +
      '<section class="panel panel--wide panel--center">' +
        '<h2 class="h2 h2--cta">Still deciding?</h2>' +
        '<p class="lead lead--13 lead--cta">Listen to a recording first, and come when it makes sense to.</p>' +
        '<div class="cta-stack"><a class="btn" style="padding:15px 24px" href="' + href("voice") + '" data-nav="voice">Listen first</a></div>' +
      '</section>'
    );
  }

  var PAGES = {
    home: renderHome, about: renderAbout, offerings: renderOfferings, moon: renderMoon,
    voice: renderVoice, events: renderEvents, corporate: renderCorporate, faq: renderFaq
  };

  var TITLES = {
    home: "Wavesbychin — sound healing, London",
    about: "About me — Wavesbychin",
    offerings: "What I offer — Wavesbychin",
    moon: "Moon Phase Rituals — Wavesbychin",
    voice: "Voice & Video — Wavesbychin",
    events: "What's on — Wavesbychin",
    corporate: "Send a message — Wavesbychin",
    faq: "FAQ — Wavesbychin"
  };

  // ---------- rendering ----------

  var app = document.getElementById("app");
  var hdr = document.getElementById("hdr");

  function render() {
    app.innerHTML = PAGES[state.page]();
    document.title = TITLES[state.page];
    var links = document.querySelectorAll(".nav__item");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle("is-active", links[i].getAttribute("data-nav") === state.page);
    }
  }

  function navigate(page, opts) {
    opts = opts || {};
    if (!PAGES[page]) page = "about";
    var changed = page !== state.page;
    state.page = page;
    render();
    if (changed || opts.force) {
      app.classList.remove("is-entering");
      void app.offsetWidth; // restart the enter animation
      app.classList.add("is-entering");
    }
    window.scrollTo(0, 0);
    track("page_view", { page_title: document.title, page_location: location.origin + location.pathname + "#/" + PATHS[page], page_path: "/" + PATHS[page] });
  }

  function pageFromHash() {
    var h = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    return ROUTES[h] || (h ? null : "about");
  }

  function onHashChange() {
    var page = pageFromHash();
    if (!page) { location.replace("#/about"); return; }
    navigate(page, { force: true });
  }

  // ---------- backend ----------

  // Resolves true only when Supabase actually accepted the row. With the
  // credentials blank nothing is stored and the forms show their mailto fallback.
  function save(payload) {
    if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) return Promise.resolve(false);
    payload = Object.assign({ source: "wavesbychin-site", page: PATHS[state.page] }, payload);
    return fetch(CFG.SUPABASE_URL + "/rest/v1/" + (CFG.SUPABASE_TABLE || "inquiries"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CFG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  // ---------- analytics ----------
  // GA4 with Consent Mode v2. gtag.js loads for every visitor but analytics_storage
  // starts 'denied' (declared in index.html <head>, before the tag), so no cookie is
  // written until Accept is pressed. Decline leaves it denied. Same pattern as maria-site.

  var GA_ID = CFG.GA_MEASUREMENT_ID || "";

  function gtag() { if (window.dataLayer) window.dataLayer.push(arguments); }

  function track(name, params) {
    if (!GA_ID) return;
    gtag("event", name, params || {});
  }

  function loadGa() {
    if (!GA_ID || document.getElementById("ga-tag")) return;
    var sc = document.createElement("script");
    sc.id = "ga-tag";
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(sc);
    gtag("js", new Date());
    // send_page_view off: the hash router reports each page itself in navigate()
    gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
  }

  function applyConsent(choice) {
    if (!GA_ID) return;
    gtag("consent", "update", {
      analytics_storage: choice === "accepted" ? "granted" : "denied",
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"
    });
  }

  // ---------- events ----------

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action], [data-nav]");
    if (!t) return;

    var nav = t.getAttribute("data-nav");
    if (nav) {
      // Plain hash link; hashchange does the rest — unless it is the page we are already on.
      if (t.getAttribute("href") === location.hash) { e.preventDefault(); navigate(ROUTES[nav] || nav, { force: true }); }
      return;
    }

    var action = t.getAttribute("data-action");
    if (action === "faq") {
      var n = Number(t.getAttribute("data-i"));
      state.faq = state.faq === n ? 0 : n;
      render();
    } else if (action === "tl") {
      var i = Number(t.getAttribute("data-i"));
      state.tl = state.tl === i ? -1 : i;
      render();
    } else if (action === "corporate-inquiry") {
      state.form.type = "corporate";
      if (state.page === "corporate") navigate("corporate"); else location.hash = "#/message";
    } else if (action === "reset-form") {
      state.sent = false;
      state.form = emptyForm();
      render();
    } else if (action === "cookie-accept" || action === "cookie-decline") {
      var choice = action === "cookie-accept" ? "accepted" : "declined";
      try { localStorage.setItem("wbc-cookie", choice); } catch (err) {}
      document.getElementById("cookie").hidden = true;
      applyConsent(choice);
    }
  });

  document.addEventListener("input", function (e) {
    var form = e.target.closest("form[data-form]");
    if (!form) return;
    var kind = form.getAttribute("data-form");
    if (kind === "message") {
      if (e.target.name in state.form) state.form[e.target.name] = e.target.value;
    } else if (kind === "subscribe") {
      state.subEmail = e.target.value;
    }
  });

  document.addEventListener("change", function (e) {
    var form = e.target.closest("form[data-form=message]");
    if (!form) return;
    state.form[e.target.name] = e.target.value;
    if (e.target.name === "type") render(); // corporate-only fields appear/disappear
  });

  document.addEventListener("submit", function (e) {
    var form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    var kind = form.getAttribute("data-form");

    if (kind === "message") {
      state.sending = true;
      state.sendError = false;
      render();
      var payload = Object.assign({ kind: "message" }, state.form);
      save(payload).then(function (ok) {
        state.sending = false;
        state.sent = ok;
        state.sendError = !ok;
        render();
        track(ok ? "message_sent" : "message_failed", { inquiry_type: state.form.type });
      });
    } else if (kind === "subscribe") {
      var email = state.subEmail;
      state.subLabel = "Adding…";
      state.subError = false;
      render();
      save({ kind: "subscribe", email: email }).then(function (ok) {
        state.subEmail = ok ? "" : email;
        state.subLabel = ok ? "Added" : "Join";
        state.subError = !ok;
        render();
        track(ok ? "subscribe" : "subscribe_failed", {});
      });
    }
  });

  // Header collapse: below 760px, scrolling down past 80px hides the wordmark, CTA and pills.
  var lastY = window.scrollY || 0;
  function onScroll() {
    var y = window.scrollY || 0;
    var narrow = window.innerWidth < 760;
    var full = !narrow || y < 80 || y < lastY;
    lastY = y;
    if (full !== state.headerFull) {
      state.headerFull = full;
      hdr.classList.toggle("is-collapsed", !full);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---------- boot ----------

  var iw = document.querySelectorAll("[data-innerwave]");
  for (var k = 0; k < iw.length; k++) iw[k].setAttribute("href", INNERWAVE);

  var stored = null;
  try { stored = localStorage.getItem("wbc-cookie"); } catch (err) {}
  if (GA_ID) {
    loadGa();
    if (stored) applyConsent(stored);
    else document.getElementById("cookie").hidden = false;
  }

  window.addEventListener("hashchange", onHashChange);
  onHashChange();
  onScroll();
})();
