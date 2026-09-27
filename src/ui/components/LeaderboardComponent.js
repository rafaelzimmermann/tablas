import { Component } from "../../core/Component.js";
import { text, settings, contextLabel, number, escapeHtml } from "../shared.js";
import { getLeaderboard, getCompositeKey, getUser } from "../../data.js";
export class LeaderboardComponent extends Component {
  render() {
    const s = this.gameState,
      key = getCompositeKey(s.gameType, s.mode, s.level);
    const entries = getLeaderboard(key),
      best = getUser(s.user)?.highScores[key];
    const hasBest = Number.isFinite(best);
    this.container.innerHTML = `<section id="leaderboard-screen"><div class="progress-head"><div class="intro"><div class="eyebrow">${text(s, "progressEyebrow")}</div><h1>${text(s, "progress")}</h1><p>${text(s, "progressSubtitle")}</p></div><a href="#home">← ${text(s, "backPlay")}</a></div>
      <div class="progress-grid"><section class="panel"><h2>${text(s, "bestRound")}</h2>
      ${s.user ? `<p class="small round-settings-note">${escapeHtml(s.user)}</p>` : ""}
      ${hasBest ? `<div class="best-number">${number(s, best)}</div><p>${text(s, "inDuration", { duration: text(s, s.mode + "Long") })}</p><p class="small round-settings-note">${contextLabel(s)}</p><p class="tip">${text(s, "bestHint")}</p>` : `<div class="empty"><h3>${text(s, "noBest")}</h3><p>${text(s, s.user ? "noBestHint" : "guestProgress")}</p></div>`}
      <button class="primary start" data-action="${s.user ? "start" : "home"}">${text(s, s.user ? "tryGame" : "backPlay")} →</button></section>
      <section class="panel"><div class="panel-title"><h2>${text(s, "scores")}</h2></div><p class="small">${text(s, "localOnly")}</p>${settings(s, true)}
      ${entries.length ? `<table class="score-table"><caption class="small">${contextLabel(s)} · ${text(s, "topTen")}</caption><thead><tr><th scope="col">${text(s, "place")}</th><th scope="col">${text(s, "player")}</th><th scope="col">${text(s, "correct")}</th></tr></thead><tbody>${entries.map((entry, i) => `<tr class="${entry.username === s.user ? "you" : ""}"><td>${i + 1}</td><td>${escapeHtml(entry.username)}${entry.username === s.user ? ` · ${text(s, "you")}` : ""}</td><td>${number(s, entry.score)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty"><h3>${text(s, "fresh")}</h3><p>${text(s, "noScores")}</p><button class="text-button" data-action="home">${text(s, "backPlay")} →</button></div>`}</section></div><p class="footnote">${text(s, "deviceHint")}</p></section>`;
  }
}
