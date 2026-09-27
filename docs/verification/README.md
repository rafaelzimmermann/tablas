> For the implemented application, see [production verification](production/README.md). The notes below describe the earlier mockup-only review.

# Design preview verification

This is a plan and mockup delivery, not a production UI migration.

- Browser: installed Chrome via Playwright/CDP; 4 views at 1440, 390 and 320px. No horizontal overflow, no JavaScript errors. See browser-checks.json and PNGs.
- Interactions: retained incorrect answer; Pause modal and Escape; completion after three demo answers; replay score reset; player preserved on Change game; category-filter empty state; navigation hidden while playing.
- Visual inspection: current desktop, proposed desktop setup/progress, mobile setup/play/results. Simplified mobile spacing and repaired hidden navigation after inspection.
- `node --check docs/mockups/mockups.js`: passed.
- `node --test tests/logic.test.js`: see logic-tests.txt.
- Premium static audit: no findings, ui-audit.json. This is a heuristic scan; existing application issues are documented in REDESIGN-PLAN.md.
- Design document lint: no errors; remaining orphan-token warnings reflect colors used by CSS rather than frontmatter component references. See design-lint.json.
- Project `npm test -- --list` could not run: repository dependencies are not installed (`playwright: command not found`). Prototype browser verification used the already-installed Playwright package in the neighboring backpack project. No dependency files were changed.
- No formatter, typecheck or build script is configured in package.json.

## Reproduce browser check

Install the project's existing dev dependencies. Start the static server on port 3001 and headless Chrome with remote debugging on port 9333, then run `node docs/verification/verify.cjs` from the project root. The script expects those processes already running. Screenshot names use view and viewport width; `home-1440.png` is the final desktop setup.

## Deliberate prototype boundaries

English-only sample copy; timer held for review; sample progress data; no storage writes; production generators and real countdown not connected. Browser Back renders views, but the production active-round Back/pause guard is still an implementation task. Touch-device testing, screen reader testing, full locale verification and testing with children remain rollout requirements. Screenshot widths verify responsive layout, not physical-device behavior.
