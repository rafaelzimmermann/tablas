import { Component } from "../../core/Component.js";
import { Timer, TIMER_MODES } from "../../timer.js";
import { LearningService } from "../../logic/LearningService.js";
import { MultiplicationGenerator } from "../../logic/generators/MultiplicationGenerator.js";
import { AdditionGenerator } from "../../logic/generators/AdditionGenerator.js";
import { SubtractionGenerator } from "../../logic/generators/SubtractionGenerator.js";
import { DivisionGenerator } from "../../logic/generators/DivisionGenerator.js";
import { getUser, getCompositeKey, saveScore } from "../../data.js";
import { OPERATIONS, RANGES, text, rangeLabel, number } from "../shared.js";
import { translate } from "../translations.js";
const GENERATORS = {
  multiplication: MultiplicationGenerator,
  sum: AdditionGenerator,
  subtraction: SubtractionGenerator,
  division: DivisionGenerator,
};
export class GameComponent extends Component {
  constructor(container, state, app) {
    super(container, state);
    this.app = app;
    this.timer = new Timer(
      (left) => this.updateTimerDisplay(left),
      () => this.endGame(true),
    );
    this.active = false;
    this.paused = false;
  }
  start() {
    const s = this.gameState;
    this.config = {
      gameType: s.gameType,
      mode: s.mode,
      level: s.level,
      user: s.user,
    };
    this.roundId =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    this.generator = new GENERATORS[s.gameType](RANGES[s.level]);
    this.active = true;
    this.paused = false;
    s.score = 0;
    s.result = null;
    s.isGameActive = true;
    this.render();
    this.nextQuestion();
    this.timer.start(TIMER_MODES[s.mode].duration);
    this.container.querySelector("#answer-input").focus();
    this.app.updateStorageStatus();
  }
  render() {
    const s = this.gameState;
    this.container.innerHTML = `<section id="game-screen" class="game-wrap"><div class="game-top"><div><h1>${text(s, s.gameType)}</h1><p>${rangeLabel(s)} · ${text(s, s.mode + "Long")}</p></div><button data-action="pause">Ⅱ &nbsp; ${text(s, "pause")}</button></div>
      <div class="panel game-panel"><div class="stats"><span class="clock"><strong id="timer-display">${TIMER_MODES[s.mode].duration}</strong> ${text(s, "secondsLeft")}</span><span class="score"><strong id="score-display">${number(s, s.score)}</strong> ${text(s, "correct")}</span></div>
      <div class="time-track" aria-hidden="true"><span id="time-progress"></span></div><div class="equation" id="question-display" role="math"></div>
      <form id="answer-form" novalidate><label for="answer-input" class="answer-label">${text(s, "answer")}</label><input id="answer-input" class="answer" type="text" inputmode="none" autocomplete="off" maxlength="8" aria-describedby="feedback question-display" spellcheck="false">
      <p id="feedback" class="feedback" role="status">${text(s, "answerHint")}</p><div class="keypad" id="number-keyboard">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "Clear", 0, "Backspace"].map((key) => `<button type="button" class="key ${typeof key === "string" ? "utility" : ""}" data-key="${key}" ${key === "Backspace" ? `aria-label="${text(s, "delete")}"` : ""}>${key === "Clear" ? text(s, "clear") : key === "Backspace" ? "⌫" : key}</button>`).join("")}</div>
      <button class="primary check" type="submit">${text(s, "check")} <span aria-hidden="true">✓</span></button></form></div></section>`;
  }
  nextQuestion() {
    const s = this.gameState,
      max = RANGES[s.level];
    // Learning data predates levels; never inject harder questions into an easier round.
    const pool = LearningService.getPool(s.user, s.gameType).filter(
      (q) =>
        q.a >= 1 &&
        q.b >= 1 &&
        (s.gameType === "division"
          ? q.b <= max &&
            q.answer >= 1 &&
            q.answer <= max &&
            q.a / q.b === q.answer
          : q.a <= max && q.b <= max),
    );
    this.currentQuestion = this.generator.generate(pool);
    this.failedCurrentQuestion = false;
    const { a, b } = this.currentQuestion,
      op = OPERATIONS.find((o) => o.id === s.gameType);
    const display = this.container.querySelector("#question-display");
    display.setAttribute(
      "aria-label",
      translate(s.language, "question", {
        a,
        b,
        operator: translate(s.language, op.word),
      }),
    );
    display.innerHTML = `<span class="operand" aria-hidden="true">${number(s, a)}</span><span class="operator" aria-hidden="true">${op.symbol}</span><span class="operand" aria-hidden="true">${number(s, b)}</span>`;
    const input = this.container.querySelector("#answer-input");
    input.value = "";
    input.removeAttribute("aria-invalid");
  }
  submit() {
    if (!this.active || this.paused) return;
    if (this.timer.getTimeLeft() <= 0) {
      this.endGame(true);
      return;
    }
    const input = this.container.querySelector("#answer-input");
    const value = input.value.trim();
    if (!value) {
      this.feedback("emptyAnswer");
      input.focus();
      return;
    }
    if (!/^\d+$/.test(value)) {
      this.feedback("invalidAnswer", "wrong");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    if (Number(value) !== this.currentQuestion.answer) {
      if (!this.failedCurrentQuestion) {
        LearningService.recordFailure(
          this.config.user,
          this.config.gameType,
          this.currentQuestion,
        );
        this.failedCurrentQuestion = true;
        this.app.updateStorageStatus();
      }
      this.feedback("wrong", "wrong");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      input.select();
      return;
    }
    this.gameState.score++;
    this.container.querySelector("#score-display").textContent = number(
      this.gameState,
      this.gameState.score,
    );
    this.nextQuestion();
    this.feedback("right", "correct");
    this.app.announce(
      translate(this.gameState.language, "statusCorrect", {
        count: this.gameState.score,
      }),
    );
    input.focus();
  }
  key(key) {
    if (!this.active || this.paused) return;
    const input = this.container.querySelector("#answer-input");
    if (key === "Clear") input.value = "";
    else if (key === "Backspace") {
      const start = input.selectionStart ?? input.value.length,
        end = input.selectionEnd ?? start;
      input.setRangeText(
        "",
        start === end ? Math.max(0, start - 1) : start,
        end,
        "end",
      );
    } else if (/^\d$/.test(key)) {
      const start = input.selectionStart ?? input.value.length,
        end = input.selectionEnd ?? start;
      if (input.value.length - (end - start) < 8)
        input.setRangeText(key, start, end, "end");
    }
    input.removeAttribute("aria-invalid");
    input.focus();
  }
  feedback(key, tone = "") {
    const el = this.container.querySelector("#feedback");
    el.className = `feedback ${tone}`;
    el.textContent = translate(this.gameState.language, key);
  }
  updateTimerDisplay(left) {
    if (!this.active) return;
    this.container.querySelector("#timer-display").textContent = number(
      this.gameState,
      left,
    );
    this.container.querySelector("#time-progress").style.width =
      `${(left / TIMER_MODES[this.config.mode].duration) * 100}%`;
    if (left === 10)
      this.app.announce(translate(this.gameState.language, "timeWarning"));
  }
  pause() {
    if (!this.active || this.paused) return;
    if (this.timer.getTimeLeft() <= 0) {
      this.endGame(true);
      return;
    }
    this.timer.pause();
    this.paused = true;
    this.container.querySelector(".game-panel").classList.add("is-paused");
    this.app.openPause();
  }
  resume() {
    if (!this.active || !this.paused) return;
    this.paused = false;
    this.container.querySelector(".game-panel").classList.remove("is-paused");
    this.timer.resume();
    this.container.querySelector("#answer-input").focus();
  }
  endGame(complete = false) {
    if (!this.active) return;
    this.active = false; // Guard timeout, submit and End from committing twice.
    this.timer.stop();
    const s = this.gameState,
      key = getCompositeKey(
        this.config.gameType,
        this.config.mode,
        this.config.level,
      );
    const previous = getUser(this.config.user)?.highScores[key];
    s.isGameActive = false;
    s.result = {
      config: { ...this.config },
      score: s.score,
      complete,
      previousBest: Number.isFinite(previous) ? previous : null,
    };
    if (complete && this.config.user)
      saveScore(this.config.user, s.score, key, this.roundId);
    this.app.show("results", { replace: true });
  }
  unmount() {
    this.timer.stop();
    this.active = false;
  }
}
