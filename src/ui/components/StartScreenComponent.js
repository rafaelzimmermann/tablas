import { Component } from "../../core/Component.js";
import {
  OPERATIONS,
  RANGES,
  text,
  escapeHtml,
  settings,
  number,
} from "../shared.js";
export class StartScreenComponent extends Component {
  render() {
    const s = this.gameState;
    const max = RANGES[s.level];
    const a = max === 9 ? 4 : max === 99 ? 24 : 124;
    const b = max === 9 ? 3 : max === 99 ? 13 : 113;
    const examples = {
      multiplication: `${a} × ${b} = ${number(s, a * b)}`,
      sum: `${a} + ${b} = ${number(s, a + b)}`,
      subtraction: `${a} − ${b} = ${a - b}`,
      division: `${a * 3} ÷ 3 = ${a}`,
    };
    this.container.innerHTML = `<section id="start-screen" class="intro"><div class="eyebrow">${text(s, "ready")}</div><h1>${text(s, "title")}</h1><p>${text(s, "subtitle")}</p></section>
      <div class="setup"><section class="panel"><div class="panel-title"><h2>${text(s, "choose")}</h2><span class="small">${text(s, "chooseOne")}</span></div>
      <div class="operations">${OPERATIONS.map((op) => `<button class="operation" data-group="gameType" data-value="${op.id}" aria-pressed="${op.id === s.gameType}"><span class="tick" aria-hidden="true">${op.id === s.gameType ? "✓" : ""}</span><span class="symbol" aria-hidden="true">${op.symbol}</span><strong>${text(s, op.id)}</strong><span class="small">${op.example}</span></button>`).join("")}</div>
      <p class="tip"><span aria-hidden="true">✦</span><span><b>${text(s, "daily")}</b> ${text(s, "dailyHint")}</span></p></section>
      <section class="panel"><div class="panel-title"><h2>${text(s, "yourRound")}</h2></div><form id="setup-form" class="round-config" novalidate>
      <label for="username-input">${text(s, "name")} <span class="optional">· ${text(s, "optional")}</span></label><input id="username-input" maxlength="15" autocomplete="off" aria-describedby="name-hint" placeholder="${text(s, "namePlaceholder")}" value="${escapeHtml(s.user || "")}"><p class="sample" id="name-hint">${text(s, "nameHint")}</p>
      ${settings(s)}<p class="sample">${text(s, "example", { example: examples[s.gameType] })}</p>
      <button id="start-game-btn" type="submit" class="primary start">${text(s, "start")} <span aria-hidden="true">→</span></button><p class="under-button">${text(s, s.mode + "Long")} · ${text(s, "confidence")}</p></form></section></div>
      <p class="footnote"><b>${text(s, "pace")}</b> ${text(s, "paceHint")}</p>`;
  }
}
