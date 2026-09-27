import { translate } from "./translations.js";
export const OPERATIONS = [
  { id: "multiplication", symbol: "×", word: "times", example: "4 × 3 = 12" },
  { id: "sum", symbol: "+", word: "plus", example: "4 + 3 = 7" },
  { id: "subtraction", symbol: "−", word: "minus", example: "7 − 3 = 4" },
  { id: "division", symbol: "÷", word: "dividedBy", example: "12 ÷ 3 = 4" },
];
export const MODES = ["bullet", "blitz", "rapid"];
export const RANGES = { 1: 9, 2: 99, 3: 999 };
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const text = (state, key, values) =>
  escapeHtml(translate(state.language, key, values));
export const number = (state, value) =>
  new Intl.NumberFormat(state.language).format(value);
export const rangeLabel = (state) =>
  text(state, state.gameType === "division" ? "divisionRange" : "range", {
    max: RANGES[state.level],
  });
export const contextLabel = (state) =>
  `${text(state, state.gameType)} · ${rangeLabel(state)} · ${text(state, state.mode + "Long")}`;
export function choices(group, values, selected) {
  return `<div class="segments">${values.map(([value, label]) => `<button type="button" data-group="${group}" data-value="${value}" aria-pressed="${String(value) === String(selected)}">${label}</button>`).join("")}</div>`;
}
export function settings(state, progress = false) {
  return `${
    progress
      ? `<fieldset><legend>${text(state, "game")}</legend>${choices(
          "gameType",
          OPERATIONS.map((op) => [op.id, text(state, op.id)]),
          state.gameType,
        )}</fieldset>`
      : ""
  }
    <fieldset><legend>${text(state, progress ? "time" : "howLong")}</legend>${choices(
      "mode",
      MODES.map((id) => [id, text(state, id)]),
      state.mode,
    )}</fieldset>
    <fieldset><legend>${text(state, progress ? "numbers" : "whichNumbers")}</legend>${choices(
      "level",
      Object.entries(RANGES).map(([level, max]) => [level, `1–${max}`]),
      state.level,
    )}
    ${state.gameType === "division" ? `<p class="sample">${text(state, "divisionHint")}</p>` : ""}</fieldset>`;
}
