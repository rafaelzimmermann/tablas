# Production redesign verification

Implementation is complete in the main application. The sibling `../README.md` describes the earlier mockup-only delivery; this file records the production pass.

## Passing checks

- `npm run test:unit`: **17 passed**. Generators, learning, legacy data helpers, per-round save deduplication, safe nickname keys, guest data boundaries, deadline timer/pause and translation parity.
- `PW_SYSTEM_CHROME=1 npm test -- --project=chromium --project=webkit --workers=2`: **28 passed**. Real setup/countdown/play/results/replay, all four operations at all three levels, wrong-answer retention, keypad, pause/focus/Escape, browser Back, local scores, saved progress filters, storage failure and localization.
- Responsive flow verification: 320, 390 and 1440px, English and Spanish, including setup, division with large operands, error feedback, pause, results and progress. No horizontal overflow or runtime page errors. Reduced-motion is enabled in these checks.
- Visual inspection: desktop setup, narrow Spanish gameplay and mobile Spanish progress. A crowded timer/score row was corrected, and the WebKit modal Tab behavior was made explicit before the final passing run.
- JavaScript syntax and `git diff --check`: passed. Modified production source and tests were formatted with Prettier. No build or typecheck script is required by this plain-JavaScript static app.
- DESIGN.md lint: no errors. Three orphan-color warnings reflect colors used through CSS rather than component entries in the document's frontmatter.

PNG files in this directory are captures of the real application, not mockups. Test data is generated in isolated browser contexts, including intentional zero-score completions and large division questions.

## Static audit disposition

`ui-audit.json` preserves the strict skill audit output. It flags four `affordance.actionless-button` findings because its parser recognizes inline onclick/template framework bindings but not DOM event delegation. Each flagged control has an actual handler in `App.handleClick`:

- StartScreen operation buttons → validated `data-group` settings branch.
- shared.js segmented settings → the same branch.
- GameComponent keypad → `GameComponent.key` via `data-key`.
- LeaderboardComponent primary action → `start` or `home` via `data-action`.

These are verified false positives, not waived missing interactions; the browser suite exercises all four. The raw strict audit is not reported as passing. No inline JavaScript or redundant listeners were added to satisfy the scanner.

## Environment limitation

Firefox was downloaded and attempted twice, including a direct `/private/tmp` profile location. Its process exits before any page loads with `Could not find profile folder`. Firefox is **not verified** in this environment; its project and all tests remain configured for another machine or CI. Chrome and WebKit both pass all tests. Browser testing uses desktop engines with resized viewports; physical-device and screen-reader checks remain separate from these results.

## Local preview

`npm start` serves port 3001, or `npm start -- 3002` for a separate preview. Tests manage their own Node static server on port 3011. The original Python preview server intermittently reset concurrent module requests; the Node server avoids that test infrastructure issue.
