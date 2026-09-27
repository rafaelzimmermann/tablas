# Tablas redesign proposal

Status: approved and implemented. The original mockups remain an archived proposal with illustrative data; the main application now runs the redesigned flow with real questions and local score storage. See `docs/verification/production/README.md` for verification.

## Review: what gets in the way

| Priority | Evidence | Impact / proposed change |
| --- | --- | --- |
| High | `index.html`, three separate setup screens | Name → operation → mode/level is too much navigation before play. Combine into one Play screen with a sensible visible default. |
| High | `ResultsComponent.js` resets all state on Play Again | Replay loses player, language and settings. Replay should start the same round; Change game should return to the preserved setup. |
| High | `GameComponent.js` validates while typing and silently clears mistakes | Editing can count as failure; children get no useful feedback. Submit with Check/Enter, retain wrong answers, allow correction. |
| High | `GameComponent.js:endGame` queries #final-score inside game, but it lives in results | Results can throw and display zero. Render results from session state; save once before presenting results. `saveScore` is imported but not called in this flow. |
| High | `style.css` body overflow:hidden | Content can be clipped on small screens or with a keyboard. Natural document scrolling, responsive spacing and safe-area padding. |
| Medium | Modes use Bullet / Blitz / Rapid; 30 seconds is Bullet and 120 is Rapid | Names do not explain the choice. Show 30 seconds / 1 minute / 2 minutes. Keep underlying IDs and score categories. |
| Medium | No `.mode-btn.active` or `.level-btn.active` CSS | Selected settings are difficult to identify. Use a strong outline, check mark, and programmatic selected state. |
| Medium | Leaderboard only filters time; operation/level are implicit and can be null | Show all three category filters and label local scope. Use personal progress as the main destination, retaining local top scores within it. |
| Medium | Results listeners added on every activation; screen changes only toggle CSS | Duplicate actions and no browser navigation/focus contract. Centralize transitions, attach listeners once and manage focus/history. |
| Medium | Flags without accessible names, unlabeled fields, partial translations | Name languages in text; label fields; translate every screen and update document language. |
| Medium | Leaderboard interpolates player names into innerHTML | Render names as text, not markup. |

Evidence is from the current component implementation, CSS, data layer and EXPANSION_PLAN.md. Old roadmap checkboxes are stale relative to the code. Browser verification is recorded separately.

## Product assumptions

Children practicing primary-school arithmetic, provisionally ages 6–10; tablet, phone and desktop use. English and Spanish remain supported. No accounts, online competition or new personal-data collection. Existing local score keys and arithmetic generators remain the foundation. Validate reading level and touch interaction with children before rollout.

## Proposed navigation

```
Play (name + operation + time + number range)
  → brief ready countdown → Round → Results
                              ↑       ├─ Play again (same settings)
                              │       └─ Change game → Play (settings retained)
Play ↔ My progress (personal bests + scores on this device)
Round → Pause → Resume / End round → Results (marked incomplete)
```

One setup page, no setup wizard. A child can start with the displayed default (Multiply, 1 minute, numbers 1–9). Name is optional for trying the game; guest scores must not be attributed to a named child. Preserve named-player behavior for saved scores. Guest behavior is a proposed addition, not an existing capability.

During play hide global navigation, show the operation and range, timer, number correct and Pause. Pausing freezes time and hides the question; ended rounds do not qualify for records. Browser Back during a round follows the same pause flow. Never send a replay back through onboarding.

## Visual plan and alternatives

A: a cartoon adventure map would add another navigation layer and new content requirements. B (chosen): a maths playboard, using the physical language of classroom number tiles. One bold expression: oversized, slightly offset operator tiles. Everything around them stays orderly.

Palette: ink #203448, paper #F4F8FC, blue #245BCC, yellow #FFDA69, mint #DDF3E8, white #FFFFFF. System rounded display type for friendly headings and numbers; system sans for readable instructions. No network font dependency in the mockup.

Desktop: operation choices left, round settings right, one dominant Start action. Mobile: same information order, two-column operation tiles, stacked settings. Play: central equation, stable feedback area and large keypad. Results: encouragement, actual correct count, contextual best and direct replay.

```
Desktop setup                      Mobile setup
[Tablas      Play | My progress]    [Tablas       Play | My progress]
[Let's play with numbers.]          [Let's play with numbers.]
[ operation tiles ][ round setup ]  [ operation tiles ]
[                ][ Start round ]  [ round setup     ]
                                   [ Start round     ]
```

Critique: avoid an adult analytics dashboard dressed in bright colors. No streak pressure, invented mastery percentages, cluttered trophies or dominant leaderboard. Number ranges describe operands, not answers; include a sample so multiplication difficulty is clear. Keep the existing 1–9 / 1–99 / 1–999 ranges visible; curriculum redesign is a separate decision.

## Mockup coverage

Open `docs/mockups/index.html`: four linked views — Play, Round, Results, My progress. Choose an operation, duration and range, start a demonstration, type or use the keypad, check answers, pause/resume and replay. Direct review links use `?view=game`, `?view=results`, `?view=progress`. The prototype labels itself as sample data and a paused demonstration timer. It illustrates interaction and layout, not the production maths engine or persistence.

## Implementation sequence after design review

1. **Repair session lifecycle.** Make result rendering/saving idempotent; prevent duplicate listeners; preserve language/player/configuration across replay; render player names safely. Regression-test result totals and score persistence.
2. **Navigation and setup.** Merge setup components into Play; establish explicit screen/session states and browser history behavior. Centralize controls, tokens and focus. Add optional guest behavior and named-score boundaries.
3. **Play and feedback.** Replace typing heuristics with explicit Check/Enter, stable feedback, pause/exit, input focus and a touch keypad that does not summon a duplicate native keyboard. Preserve generator and learning integration; record only submitted mistakes.
4. **Results and progress.** Replay, Change game, contextual personal records, fully specified local score categories, honest empty states and unavailable-storage messages. Do not invent historical accuracy: current schema does not store it.
5. **Localization and verification.** EN/ES copy and document language; 320px phone through desktop, short viewport, 200% zoom, touch/keyboard, reduced motion, screen-reader announcements, timer completion, repeated rounds, fresh/returning users, blocked localStorage and browser Back. Run unit and Playwright suites with a running server.

## Acceptance criteria

- First play requires one setup page; replay requires one action.
- Selected values are visible and match session state.
- Wrong submissions explain the next action and retain input; typing/backspace never records mistakes.
- Completed rounds display and save the exact score once in the correct category.
- No clipping, inaccessible controls or double keypad on mobile.
- EN/ES and browser navigation behave consistently across every screen.
- No production rollout until the proposed flow and visual direction are reviewed.
