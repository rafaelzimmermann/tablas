---
version: alpha
name: Tablas
description: A maths playboard built from bright classroom number tiles.
colors:
  ink: '#203448'
  background: '#F4F8FC'
  primary: '#245BCC'
  accent: '#FFDA69'
  mint: '#DDF3E8'
  surface: '#FFFFFF'
typography:
  display:
    fontFamily: 'ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif'
  sans:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
rounded:
  control: '14px'
  panel: '26px'
spacing:
  page-max: '1080px'
  section-gap: '28px'
components:
  button:
    height: '48px'
  keypad:
    height: '54px'
---

# Tablas design direction

## Overview

Approved by the user and implemented in the production application. `docs/mockups/` preserves the original design proposal. Primary-school arithmetic practice, provisionally ages 6–10. English and Spanish are established locales; market is unspecified. Mockups use English sample content. All production strings must follow the chosen locale.

North star: a physical classroom maths playboard. Oversized operator tiles carry the personality; the question and answer carry attention during play. Avoid marketing heroes, adventure-map detours and adult dashboard density.

## Colors

Frontmatter mirrors the production canonical CSS custom properties in `style.css`: colors map directly to --ink, --background, --primary, --accent, --mint, --surface. Dark ink on pale surfaces; white on primary actions. Yellow is an expressive tile color, not a warning. Selection also uses a check mark and border. No dark theme proposed in this pass.

## Typography

Display stack for headings, symbols and equations; sans stack for body and controls. Body 16px with 1.5 line height, labels 13–14px, responsive headings 32–44px. Numerals use tabular widths where time/score updates. No external fonts or late font swaps. EN/ES copy must wrap naturally.

## Layout

1080px content max; 28px section gap. Setup uses two columns above 760px; phones stack content in reading order. Touch targets at least 48px. Natural document scrolling and safe-area padding. Gameplay limits width to 540px. Feedback reserves space so answer controls stay still.

## Elevation & Depth

White panels on cool paper; subtle bottom-edge shadows make interactive tiles feel physical. No blur, ambient animation or floating decorative objects.

## Shapes

14px controls, 26px panels. Mathematical symbols are typographic, not platform-dependent emoji. Small rotation belongs only to operator tiles and the result badge.

## Components

Shared button, operation tile, segmented choice, field, header, keypad and feedback styles live in the production stylesheet. All use semantic HTML, visible focus, hover and pressed states. Selected choices expose aria-pressed. Blue is the single primary action; neutral controls for navigation. Pause uses a native dialog with explicit controls, Escape and focus restoration.

Production ownership: App owns screen transitions; GameState owns player/language/config/session; Timer owns time; GameComponent owns submitted answers; ResultsComponent owns results display; data.js owns persistence. Evolve these owners rather than build a parallel production app. The shared field/button/feedback styles and src/ui/shared.js own repeated presentation. Retired game-selection and mode-selection screens have been removed.

Production token path: `style.css :root` → shared selectors → setup, play, results and progress components. This document mirrors those values. The archived mockup stylesheet is a review artifact, not a second runtime token owner. Behavioral contracts are in UX-CONTRACT.md.

Motion is limited to brief button interaction, removed with prefers-reduced-motion. Scrollbar colors inherit globally, with forced-colors support. Labels say what happens: Start round, Check answer, Play again, Change game. Errors are instructional, never punitive. Production displays only actual local results. Archived mockup scores are explicitly labeled and never stored.

## Do's and Don'ts

- Do preserve player, language and settings across replay.
- Do make the next action clear on every screen.
- Don't clear an incorrect answer while a child is still typing.
- Don't present local sample scores as online rankings or mastery data.
