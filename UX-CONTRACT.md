# Tablas interaction contract

Approved playboard redesign. Visual tokens and rationale live in DESIGN.md.

## Sources and ownership

The requested redesign and docs/REDESIGN-PLAN.md establish the new flow. EXPANSION_PLAN.md describes the four operations, learning pool, and composite score categories. Existing generators and data.js retain those data contracts. No account, online leaderboard or new external service is introduced.

| Capability | Canonical owner | Variants / verification |
| --- | --- | --- |
| Navigation, language, focus | src/ui/App.js | Home, countdown, round, results, progress; browser tests |
| Player, configuration, result | src/core/GameState.js | Guest / named player; replay tests |
| Choices and labels | src/ui/shared.js | Operation, duration, number range; aria-pressed and localization tests |
| Time and pause | src/timer.js | Deadline-based running / paused; unit and browser tests |
| Answers and learning | GameComponent / LearningService | Explicit Check/Enter only; retry and score tests |
| Score storage | src/data.js | Legacy local keys, per-round deduplication, memory fallback |
| Pause dialog | App / native dialog | Modal, initial Resume focus, Escape resumes, background inert |
| Feedback | GameComponent / App announcer | Inline correction and separate score/time announcements |
| Scroll and visual states | style.css | Global visible scrollbars, natural document scrolling |

## Flow and preservation

Home combines nickname (optional), operation, duration and level. Defaults are multiplication, 60 seconds, level 1. Start shows a three-second countdown. Cancel returns to the preserved setup. During a round the navigation and language switch are hidden; Pause hides the question, freezes the deadline, and opens the modal. Escape resumes. Leaving the tab pauses gameplay; hiding the tab during countdown cancels setup's pending start. Browser Back during play opens the same pause state, keeping the round route. A true page unload uses the narrow beforeunload guard; refresh cannot restore an active round.

Completed rounds go to Results. Play again starts a new countdown with the completed round's exact player/configuration, retaining the current language. Change game returns to the preserved setup. End this round produces an incomplete result with no saved score. Revisiting results never commits again. Guest rounds and guest mistakes are never persisted.

Progress shows the current named player's best for the selected category, not an invented accuracy or mastery metric. Local top-10 rounds include explicit game, mode and level filters. Filters are encoded in the progress URL and restored on reload/Back. Nicknames stay out of URLs and render as escaped text. Language and nickname are kept in memory for the visit; they are not added to new preference storage.

## Input and feedback

Typing, clearing and backspacing never record mistakes. Only Check/Enter submits, with IME composition guarded. Empty/non-integer values receive inline guidance. Wrong answers remain editable and receive aria-invalid. At most one learning entry is recorded per missed question in a round. Correct answers increment score, replace the question, clear input and retain input focus. The touch keypad and physical keyboard share submission; inputmode=none avoids a second virtual keypad. Screen reader feedback never announces every timer tick.

## Data and failure

Completed named rounds save once under the existing operation_mode_level category. Prior high score is captured before saving. Storage exceptions and malformed containers fall back to session memory and a persistent translated warning; corrupt stored containers are not overwritten. No retry loops or remote sync. An incomplete round never qualifies for a record. Learning questions are filtered to the current level; division keeps the established divisor/answer range and explains that the dividend can be larger.

## Accessibility and localization

English and Spanish cover all owned labels, errors, aria text and feedback. Document language and titles update with the selected locale; number formatting follows it. Native buttons, links, form labels, fieldsets and table headers supply semantics. Selections expose aria-pressed and a visual outline/check. Dialog focus returns to the answer. Screen transitions focus main; setting changes restore focus to their control. Reduced motion disables transitions, forced colors retain selection outlines, and small/zoomed layouts scroll naturally.
