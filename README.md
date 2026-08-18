# Drunk Coin ($DRUNK) — website

Static multi-page site. No build step, no dependencies: open `index.html` in a
browser and it works. The one thing it loads from elsewhere is X's timeline
widget on `party.html`, and that degrades to plain links — see
[Linking the X posts](#linking-the-x-posts).

**This is a pre-launch site.** $DRUNK is not out yet, so nothing here invites
anyone to acquire it: there is no chart, no contract pill, no swap instructions
and no "buy" button anywhere. The whole site points at one thing — the
countdown in `launchDate`. See [Turning the site on at launch](#turning-the-site-on-at-launch).

## Structure

```
.
├── index.html          Home — hero, countdown, why $DRUNK, stats, meme strip, CTA
├── story.html          The Story — timeline of the night + napkin manifesto
├── tokenomics.html     Drunkonomics — key figures + supply breakdown
├── gallery.html        The Meme Vault — filterable meme grid, lightbox, media kit
├── buy.html            Get Ready — pre-launch prep, countdown, scam notice, FAQ
├── party.html          The Party — socials, Bar Map, Wall of Fame
├── 404.html            Not-found page
│
├── css/
│   ├── tokens.css      Design tokens: colour, type, spacing, radius, shadow, motion
│   ├── base.css        Reset, element defaults, a11y helpers, utilities, grain
│   ├── layout.css      Containers, sections, grid objects, ambient background
│   ├── components.css  Every reusable block (buttons, cards, timeline, FAQ, toast…)
│   ├── nav.css         Site header + mobile menu
│   ├── footer.css      Site footer
│   ├── drunk-mode.css  Everything the "Drunk Mode" toggle changes
│   ├── home.css        Hero + meme strip (index.html only)
│   ├── gallery.css     Meme grid, lightbox, media kit (gallery.html only)
│   └── countdown.css   Launch clock — full block + hero chip
│
├── js/
│   ├── config.js       ← the only file you edit at launch
│   ├── site.js         Shared behaviour, loaded on every page
│   ├── gallery-data.js The meme catalogue — one entry per image
│   ├── gallery.js      Meme grid, filters and lightbox (gallery.html only)
│   ├── countdown.js    Launch countdown (index.html, buy.html, party.html)
│   └── posts.js        "Latest on X" — live X timeline + fallback (party.html)
│
└── assets/
    ├── favicon.svg
    ├── brand/          Logo sizes, favicons, 1200×630 social card
    └── gallery/        Web-sized memes (1200px) + thumbs/ (560px)
```

The stylesheets are linked in cascade order (tokens → base → layout →
components → nav/footer → drunk-mode → page). Keep that order if you add a
`<link>`.

## Launch checklist

Everything that changes at launch lives in **`js/config.js`**:

| Field | What it does |
|---|---|
| `launchDate` | When the doors open, as an ISO 8601 string (`2026-08-29T16:20:00Z`). Drives every countdown on the site. Empty or unparseable → the countdown blocks hide themselves. |
| `socials` | X and Telegram URLs — the only two channels the site links to. An empty one stays disabled and shows a "coming soon" toast instead of navigating. Also where the "Latest on X" block reads the handle from. |
| `postsMode` | How that block fills itself: `"auto"` (live widget, hand-kept list as fallback), `"live"`, or `"manual"`. See [Linking the X posts](#linking-the-x-posts). |
| `posts` | The hand-kept list behind `"auto"` and `"manual"` — one entry per post (`url`, `text`, `date`, optional `pinned`). |
| `contract` | The SPL mint address. Nothing prints it yet — no page has a `data-contract` element — but `js/site.js` still fills any element that gets one, so it's here ready for launch day. |

**One thing that isn't in `config.js`:** the `og:image` / `twitter:image` tags
point at `assets/brand/og.jpg` with a *relative* path. Most scrapers resolve
that fine, but X and Facebook prefer absolute URLs — once you have the domain,
find-and-replace `content="assets/brand/og.jpg"` with the full
`https://yourdomain.com/assets/brand/og.jpg` across the `.html` files.


## Linking the X posts

`party.html` carries a **Latest on X** block under the two channel cards. How
it fills itself is `postsMode` in `js/config.js`:

| `postsMode` | What the block shows |
|---|---|
| `"auto"` (shipped) | X's live timeline widget, with the hand-kept `posts` list — or the single feed card — taking over if the widget never renders |
| `"live"` | The widget only. If it doesn't render, the feed card, never a stale list |
| `"manual"` | The `posts` list only. Nothing external loads |

### The live timeline

`"auto"` and `"live"` drop X's own timeline widget into the block: it shows the
account's latest posts and keeps itself current, so posting on X is the only
step — nothing here is edited. `js/posts.js` builds the widget's anchor from
`socials.x`, loads `platform.twitter.com/widgets.js` once the block is coming
up on screen, and asks for it with `dnt=true`.

Two things come with it, and both are the price of "automatic":

- **It's X's frame, not our cards.** Everything inside that box — type,
  spacing, the follow button — is rendered by X in an iframe. `.posts-embed`
  in `css/components.css` can only frame it to match the cards around it.
- **It's a third-party script**, the only one on the site. It won't load for
  visitors running an ad blocker, and it sets X's own cookies for the ones it
  does load for.

There is no free way around either. X's API needs a paid tier *and* a secret
key, and a secret can't live in a static site — that route means a small
server (or a scheduled job that commits the posts into the repo) plus the
subscription, in exchange for posts rendered in our own card design.

### The fallback list

Under `"auto"` the widget failing is not a dead section: `posts` in
`js/config.js` is rendered instead, as the site's own cards. It's also the
whole block under `"manual"`. One entry per post, newest first:

```js
posts: [
  {
    url:    "https://x.com/_DrunkCoin_/status/1234567890123456789",
    text:   "The bar opens 29 Aug, 16:20 UTC. 🍻",
    date:   "12 Aug 2026",
    pinned: true            // optional — adds the 📌 chip
  }
]
```

Copy `url` straight off the post ("Copy link" on X); the `?s=…` an app share
adds is only tracking, drop it. Entries without a `url` are skipped — a post
card that goes nowhere is worse than one card fewer. With the list empty, the
block shows one card and one button, both pointing at `socials.x`.

If `socials.x` is empty *and* `posts` is empty, the whole block hides itself —
there is nothing left to point at. With posts listed but no `socials.x` the
cards still work, and the `@handle` above each quote falls back to `$DRUNK`,
since a handle is only ever read out of that URL.


## The launch countdown

Before launch the site runs a clock instead of a chart. It's driven entirely by
`launchDate` in `js/config.js` and rendered by `js/countdown.js`:

| `launchDate` | Result |
|---|---|
| Empty, or not a date | Every countdown block hides itself — nothing else on the page changes |
| In the future | The clock ticks once a second |
| Reached / in the past | The clock is replaced by the "the bar is open" panel, and the timer stops |

Write it as an ISO 8601 string with a trailing `Z`, and keep it in UTC. The
"doors open …" line under the clock is deliberately **not** localised: it's
pinned to `en-GB` and `timeZone: "UTC"`, for two reasons. The site is English
only, and a visitor's browser would otherwise render that one line in Italian
or Japanese; and 16:20 UTC is only 4:20 in UTC — convert it to local time and
the joke lands nowhere. The countdown numbers themselves are the same
everywhere regardless, since they're a duration.

There are two shapes of the same clock, both fed by one timer so they can't
drift apart:

- the full block (`.countdown`) on `index.html`, `buy.html` and `party.html`;
- a one-line chip (`.hero__countdown`) under the hero badge on `index.html`.

To drop one on another page: link `css/countdown.css` in the `<head>`, add
`<script src="js/countdown.js"></script>` after `site.js`, and copy the
`[data-countdown-root]` section from `party.html`. The hooks are
`data-countdown-root` on the wrapper, `data-countdown-clock` /
`data-countdown-live` on the two states, and
`data-countdown="days|hours|minutes|seconds"` on the number slots.

The clock itself is `aria-hidden`: four numbers changing every second is
unusable with a screen reader. It's mirrored into a polite live region
(`data-countdown-status`) that only announces on the hour.

## Turning the site on at launch

When the clock hits zero the countdown blocks swap themselves over on their own,
and the two `data-countdown-live` panels start showing "the bar is open". Nothing
else does — everything below is copy a human has to change, and all of it was
deliberately written to be true *before* launch:

| Where | What's pre-launch about it |
|---|---|
| `index.html` hero | The `badge--soon` pill reads "Launching on Solana", and there's no contract pill under the buttons. The pill markup was removed, not hidden — re-add a `.contract` block with `data-contract` / `data-copy-contract` and `js/site.js` fills it from `config.contract`. |
| `index.html` | The **live chart** section was deleted outright, along with `js/chart.js` and the chart half of `css/home.css`. If you want it back, pull it from git history rather than rebuilding it. |
| `buy.html` | The whole page is "Get Ready" — wallet, practice, channels, wait — plus a card stating there is no token yet. That card is the first thing to rewrite. |
| `party.html` | Bar Map Phase 1 is chipped "Launch night", not "Done". Wall of Fame quotes are about waiting, not holding. |
| `tokenomics.html` | Figures are labelled as *planned* ("Planned Tax", "to be renounced at launch"). |
| Every page | The nav CTA points at `party.html`; the footer disclaimer states the token has not launched and that anything trading under the name is a scam. |

The nav route is still `buy.html` with `data-nav="buy"` — only the visible label
changed to "Get Ready", so `css/nav.css` needed no edit and old links still work.

## The Meme Vault

`gallery.html` renders itself from **`js/gallery-data.js`** — a plain array, one
object per image. To add a meme:

1. Export two JPEGs from the original:
   - `assets/gallery/<slug>.jpg` — longest side 1200px, quality ~82
   - `assets/gallery/thumbs/<slug>.jpg` — longest side 560px, quality ~76
2. Append an entry to `window.DRUNK_MEMES`:

   ```js
   {
     slug: "<slug>",              // matches both file names
     title: "Shown under the thumbnail",
     alt: "Factual description — this is what screen readers read out",
     caption: "Ready-to-paste social copy. $DRUNK 🍻",
     tags: ["party"],             // brand | party | chart | degen
     wide: true                   // only for 16:9 art — spans two columns
   }
   ```

The filter chips count themselves, so a new tag value only needs adding to the
`FILTERS` array at the top of `js/gallery.js`. Nothing else changes.

**Why the grid reorders itself.** A `wide` meme takes two columns. Left in
catalogue order it eventually reaches a row with only one column free, gets
bumped down, and leaves a hole behind it. `pack()` in `js/gallery.js` walks the
list and, whenever the next item is too wide for what's left of the row, pulls
forward the first one that does fit — so the grid is always full. It reorders
the **DOM**, not just the layout, which is the point: visual order and lightbox
order stay identical, so `←`/`→` go where you expect. The packing depends on
the column count, so it re-runs on the 620px and 1000px breakpoints, and the
open lightbox re-finds its meme by slug afterwards.

Two ratios go with that: `.meme--wide .meme__frame` is `2.06 / 1` — two columns
plus the gap, at exactly one column's height, so a banner sits flush with the
squares beside it. Below 620px nothing spans anything, so it reverts to `16 / 9`.

The **media kit** block lower down the page serves `assets/brand/` — the square
logo for profile pictures, the 1024px avatar, and the 1200×630 card. Those are
generated from the original logo art; keep the file names if you re-export.

## Design system

Both the palette and the type are derived from the artwork in
`assets/gallery`, so the site and the memes read as one thing.

**Colour.** The values in `css/tokens.css` come from sampling every gallery
image and bucketing by hue, saturation and brightness. Two things that came out
of that and are easy to get wrong by eye:

- the darks in those scenes are **indigo-blue** (hue ~238), not purple-black —
  hence `--c-bg: #080a28`;
- the neon that carries almost every frame is **cyan**, so `--c-cyan` is a
  first-class accent, not a tint.

| Token | Value | Where it earns its place |
|---|---|---|
| `--c-bg` | `#080a28` | page, nav scrim, overlays |
| `--c-bg-raised` | `#1b1140` | timeline dots, chips |
| `--c-gold` | `#f5ce4d` | the coin — headlines, buttons, tapes |
| `--c-cyan` | `#5ce3f2` | neon sign, nav hover, filters, lightbox chrome |
| `--c-pink` | `#ff4fe0` | outline type, alt tape, sells |
| `--c-purple` | `#9b4de0` | ambient orbs |
| `--c-green` | `#2bf0a4` | "live", buys, done chips |

**Type.** Four faces, all free on Google Fonts, each matched to lettering that
actually appears in the art:

| Token | Face | Used for |
|---|---|---|
| `--font-display` | Luckiest Guy | h1/h2, hero, brand — the coin's own hand-lettering |
| `--font-neon` | Monoton | the `OPEN 24/7` sign, and nothing else |
| `--font-body` | Fredoka | all running text |
| `--font-ui` | Fredoka 700 | buttons, chips, tabs, labels, figures |

The `--font-display` / `--font-ui` split is the rule worth keeping: **Luckiest
Guy is drawn for size.** Below roughly `.9rem` its strokes close up and the
counters fill in, and its dollar sign — which appears in nearly every button on
this site — goes first. Anything small, dense, or containing `$DRUNK` uses
`--font-ui`. Monoton has the opposite problem: its double-line tube only reads
above ~30px, which is why the neon sign is set at `2rem`.

Luckiest Guy also has no tabular numerals, so the countdown digits reserve two
characters (`min-width: 2ch` on `.countdown__value`) instead — otherwise a `1`
re-centres the number on every tick and the whole clock wobbles.


## Conventions

- **Class names** follow `block__element--modifier`. State classes are `is-*`
  (`is-open`, `is-visible`, `is-scrolled`, `is-drunk`) and are always toggled
  from JavaScript.
- **Behaviour hooks** are `data-*` attributes, never classes:
  `data-drunk-toggle`, `data-copy-contract`, `data-contract`, `data-social`,
  `data-menu-open`, `data-menu-close`, `data-count`, `data-width`, `data-nav`,
  `data-countdown-root`, `data-countdown-clock`, `data-countdown-live`,
  `data-countdown-date`, `data-countdown-status`, `data-countdown`,
  `data-posts-root`, `data-posts-embed`, `data-posts-grid`, `data-posts-empty`,
  `data-posts-loading`.
- **No hard-coded colours** outside `css/tokens.css`. The one unavoidable
  exception is `rgba()` glows and gradients, which need the channels inline —
  if you retune a brand colour, grep the other stylesheets for its old RGB
  triplet as well.
- **Scroll reveals**: add `class="reveal"` to any element; stagger siblings with
  an inline `style="--delay:.08s"`. `js/site.js` collects them once, at load, so
  anything rendered later needs its own observer — see `js/posts.js`.

## Adding a page

1. Copy any inner page (e.g. `story.html`) — the nav, footer and script tags
   are identical everywhere.
2. Change `<title>`, the meta description, and `<body data-page="…">`.
3. Add the new route to the nav markup on **every** page.
4. Add the page's `data-page` / `data-nav` pair to the two grouped selectors in
   `css/nav.css` (section 4) so the active link highlights itself.

Two CSS gotchas worth knowing before you copy the grids around:

- Image grids use `minmax(0, 1fr)`, not `1fr`. Plain `1fr` floors each column at
  the image's intrinsic width and the row blows out sideways.
- If an `<img>` carries `width`/`height` attributes, also set `height: auto` in
  CSS. The attributes are presentational hints and the height one otherwise
  beats `aspect-ratio`.

## Deploying

Upload the folder as-is to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages). `404.html` is picked up automatically by most of them.
