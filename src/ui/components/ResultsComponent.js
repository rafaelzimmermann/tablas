import { Component } from "../../core/Component.js";
import { text, contextLabel, number } from "../shared.js";
import { storageUnavailable } from "../../data.js";
export class ResultsComponent extends Component {
  render() {
    const s = this.gameState,
      result = s.result;
    if (!result) return;
    const config = { ...result.config, language: s.language };
    const saved = result.complete && config.user;
    this.container.innerHTML = `<section id="results-screen" class="result-wrap"><div class="panel result-panel"><div class="result-badge" aria-hidden="true">${result.complete ? "✓" : "Ⅱ"}</div><div class="eyebrow">${text(s, result.complete ? "complete" : "early")}</div>
      <h1>${text(s, config.user ? "namedResult" : "resultTitle", { name: config.user })}</h1><p>${contextLabel(config)}</p><div id="final-score" class="result-number">${number(s, result.score)}</div><div class="result-caption">${text(s, "correctAnswers")}</div>
      <div class="result-context"><div>${text(s, saved && result.previousBest !== null ? "previousBest" : "thisRound")}<strong>${saved && result.previousBest !== null ? `${number(s, result.previousBest)} ${text(s, "correct")}` : text(s, "practice")}</strong></div>
      <div>${text(s, "thisRound")}<strong>${saved && !storageUnavailable() ? text(s, result.previousBest === null ? "firstRound" : result.score > result.previousBest ? "record" : "practice") : text(s, "practice")}</strong></div></div>
      <div class="result-actions"><button class="primary" id="restart-btn" data-action="replay">${text(s, "replay")} →</button><button data-action="home">${text(s, "changeGame")}</button></div><p class="under-button">${text(s, "replayHint")}</p>
      <p class="under-button">${text(s, !result.complete ? "earlyResult" : !config.user ? "guestResult" : storageUnavailable() ? "storageError" : "saved")}</p></div>
      <button class="text-button" data-action="progress">${text(s, "seeProgress")} →</button></section>`;
  }
}
