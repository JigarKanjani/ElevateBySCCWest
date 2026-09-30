# Elevate — Supply Chain Canada West

Competency assessment and learning-path prototype for Supply Chain Canada West
(Alberta & BC). Static site: no build step, no framework, no runtime dependencies.

## Layout

```
src/
  index.html          entry point
  css/styles.css      design tokens + all styling
  js/engine.js        scoring, gap analysis, adaptive item selection, radar chart
  assets/             SCC West roundel at the sizes the UI and favicons use
  vendor/
    data-core.js      competency framework: domains, levels, career tracks
    data-questions.js assessment item bank
    courses.js        course catalogue, part A
    courses-bc.js     course catalogue, parts B and C
    app.js            state, router, views
```

The `vendor/` scripts were previously loaded from separate Vercel projects
(`elevate-assets`, `elevate-questions`, `elevate-content`, `elevate-lib`). They
are vendored here so the site deploys as one self-contained unit with no
cross-project runtime dependency.

## Local development

```bash
python3 -m http.server 8000 --directory src
# http://localhost:8000
```

## Deployment

Deployed on Vercel from this repository. `vercel.json` serves `src/` directly —
there is no build command.

## Brand

Applies the **Supply Chain Canada 2022 Brand Guidelines v2.1**.

### Colour

| Role | Hex | Source |
|---|---|---|
| Primary red | `#ED1C24` | Guide 04 — PANTONE 185 C, RGB 237/28/36 |
| Secondary black | `#000000` | Guide 04 |
| Grey | `#A9A3A1` | Guide 04 |
| White | `#FFFFFF` | Guide 04 |

Red is the primary; black is used moderately as enhancement, per the guide.
Every colour is a CSS custom property in the `:root` block of
`src/css/styles.css`, with dark-mode overrides under both
`prefers-color-scheme: dark` and `[data-theme="dark"]`. Rebranding is done by
editing those tokens, not by touching component rules.

`--brand-red` is the untouched guideline value. The `--red-400/500/600/700`
ramp exists only so small text and filled buttons clear WCAG AA — white on
`#ED1C24` is 4.38:1, just under the 4.5:1 needed at body size, so filled
surfaces use `--red-fill` (`#DC1620`, 5.03:1) instead. Contrast was measured in
both themes, not estimated; everything reads AA at its rendered size.

### Typography

Aaux Next is the corporate face (Guide 03), used Bold for headlines, Semi Bold
for sub/box titles and Light/Regular for body. It is a licensed desktop family
with no web distribution, so the stack lists it first and falls back to
**Source Sans 3**, which carries the same four weights (300/400/600/700). If
the organisation licenses Aaux Next for web, dropping the web-font files in and
adding an `@font-face` block is the only change needed.

Guide 03.1 sets headlines in `#ED1C24` and super titles in `#000000`; `h2` and
`.supertitle` implement that.

### Logo

`src/assets/` holds the supplied SCC West roundel at 32/48/96/144/192/512px.
The mark already carries its own red disc, so it is never tinted, recoloured or
placed on a red ground (Guide 02.3).

It is used at **44px minimum**. Below that the node-network leaf and the "WEST"
logotype stop resolving, which Guide 02.2 prohibits — so the mark does *not*
shrink further on small screens. Supplying a vector (SVG/EPS) version would
render the fine strokes more crisply at small sizes than the raster asset does.

### Two deliberate departures

1. **Functional status colours.** Red is the brand primary, so it cannot also
   mean "error" without making wrong answers read like calls to action. Quiz
   correctness therefore uses a green (`--ok-500`) / deep red (`--err-500`)
   pair, and gap indicators use amber (`--warn-500`). These are confined to
   functional feedback; all brand surfaces stay strictly red/black/grey/white.
2. **Sentence-case headings.** Guide 03.1 sets headlines in all caps. That
   reads well on short marketing titles but not on sentence-length headings
   like "Your resume says. The assessment knows." Headings take the specified
   red and Bold weight but keep sentence case. Adding
   `h2 { text-transform: uppercase; }` switches to full compliance.

## The flow

One path, five steps, each named for what the person does rather than what the
system does:

| Step | They do | They get |
|---|---|---|
| 1 · Your goal | Pick one of six target jobs | The benchmark they are measured against |
| 2 · Your resume | Upload a file or paste text | Parsed in-browser, never uploaded |
| 3 · What we found | Review and correct | What the resume *claims*, clearly labelled as unverified |
| 4 · The quiz | ~20 adaptive questions | Difficulty tracks their answers |
| 5 · Your gaps | — | The report, then the lesson list that closes it |

Progress is saved to `localStorage`, so the flow survives a closed tab.

## The gap report

The report is a **bullet chart**: one data series (the verified level) plus two
reference marks (what the job needs, what the resume claimed). They are
separated by *shape* as well as colour — a filled bar, an ink tick, a hollow
dot — so the chart survives colourblindness, greyscale printing and forced-colors
mode. Every row is directly labelled; nothing depends on reading a hue.

Encoding decisions, made against the measured numbers rather than by eye:

- **Gap size is ordinal**, so it uses a single-hue sequential red ramp
  (verified monotonic in lightness), not a set of categorical hues.
- **"At the level" is the one true status**, in green, and always ships with a
  ✓ and the words — colour is never the only carrier.
- An earlier amber/deep-red severity pair was **cut**: measured at ΔE 0.3 in
  deuteranopia and 12.7 for normal vision, it was indistinguishable. The
  sequential ramp replaced it.
- The radar is styled from CSS custom properties, so it re-steps for dark mode
  instead of keeping light-mode values, and its `aria-label` narrates the
  actual per-domain figures.

Alongside it, **Resume vs assessment** names the areas where the quiz disagreed
with the resume, in both directions — the product's central claim, made legible.

## Responsive

Spacing is fluid (`clamp()`) rather than fixed, so gutters, section rhythm and
card padding scale continuously instead of snapping at breakpoints. Verified
with no horizontal overflow at 360, 390, 430, 768, 1024, 1366, 1600 and 1920px.

| Element | Desktop | Tablet | Phone |
|---|---|---|---|
| Domain grid (`.g3`) | 3 col | 2 col ≤1000px | 1 col ≤640px |
| Pair grid (`.g2`) | 2 col | — | 1 col ≤760px |
| Pricing | 3 col | 2 col ≤980px | 1 col ≤680px |
| Lesson player | 270px rail | 225px ≤1100px | stacked ≤900px |

Controls clear a 44px hit target on touch pointers, and
`prefers-reduced-motion` disables transforms and transitions.

## Status

Prototype for internal review. Self-assessment and development guidance only.
Not a credential and not part of the SCMP designation process.
