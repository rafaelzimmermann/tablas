# Tablas

A small, local-first arithmetic game for children. One setup screen, four operations, timed rounds, pause/resume, explicit answer checking and personal progress. English and Spanish are supported. Guest rounds are not saved; named scores stay in this browser's local storage.

## Run locally

Use Node.js 22 or later for the development tools and tests.

```sh
npm ci
npm start
```

Open http://127.0.0.1:3001. Another port can be supplied with `npm start -- 3002`. Production is plain HTML, CSS and ES modules: serve the repository with any static web server, or use the existing Docker configuration. No build step or backend is required.

## Verify

```sh
npm run test:unit
npx playwright install
npm test
```

Playwright starts and stops its own static server on port 3011. To use an installed Chrome instead of downloading Chromium:

```sh
PW_SYSTEM_CHROME=1 npm test -- --project=chromium
```

`TABLAS_CAPTURE=1` saves responsive Chrome screenshots into `docs/verification/production/`. The regression suite covers replay, saving once, guest play, answer correction, pause/focus, browser Back, all operations/ranges, safe names, storage failure, localization and responsive layouts.

## Design and behavior

- [Design system](DESIGN.md): accepted visual direction and runtime token ownership.
- [Interaction contract](UX-CONTRACT.md): navigation, data, accessibility and recovery rules.
- [Original review and plan](docs/REDESIGN-PLAN.md).
- [Design mockups](docs/mockups/index.html): archived interactive proposal with illustrative data.
- [Implementation verification](docs/verification/production/README.md).
