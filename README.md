# Elevate — Supply Chain Canada West

Competency assessment and learning-path prototype for Supply Chain Canada West
(Alberta & BC). Static site: no build step, no framework, no runtime dependencies.

## Layout

```
src/
  index.html          entry point
  css/styles.css      design tokens + all styling
  js/engine.js        scoring, gap analysis, adaptive item selection
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

## Theming

All colour, typography, radius and shadow values are CSS custom properties
declared in the `:root` block of `src/css/styles.css`, with dark-mode overrides
under both `prefers-color-scheme: dark` and `[data-theme="dark"]`. Rebranding is
done by editing those tokens rather than by touching component rules.

## Status

Prototype for internal review. Self-assessment and development guidance only.
Not a credential and not part of the SCMP designation process.
