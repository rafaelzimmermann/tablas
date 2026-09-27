import { StartScreenComponent } from "./components/StartScreenComponent.js";
import { CountdownComponent } from "./components/CountdownComponent.js";
import { GameComponent } from "./components/GameComponent.js";
import { ResultsComponent } from "./components/ResultsComponent.js";
import { LeaderboardComponent } from "./components/LeaderboardComponent.js";
import { Timer } from "../timer.js";
import { OPERATIONS, MODES, RANGES, text } from "./shared.js";
import { translate } from "./translations.js";
import { storageUnavailable, getLeaderboard } from "../data.js";
export class App {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.main = document.querySelector("#main");
    this.dialog = document.querySelector("#pause-dialog");
    this.components = {
      home: new StartScreenComponent(this.main, state),
      countdown: new CountdownComponent(this.main, state),
      round: new GameComponent(this.main, state, this),
      results: new ResultsComponent(this.main, state),
      progress: new LeaderboardComponent(this.main, state),
    };
    this.countdown = new Timer(
      (left) => {
        const display = document.querySelector("#countdown-display");
        if (display && left > 0) display.textContent = left;
      },
      () => {
        this.screen = "round";
        this.renderShell();
        this.components.round.start();
      },
    );
  }
  mount() {
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    this.container.addEventListener(
      "click",
      (event) => this.handleClick(event),
      options,
    );
    this.container.addEventListener(
      "input",
      (event) => {
        if (event.target.id === "username-input")
          this.state.user = event.target.value;
        if (event.target.id === "answer-input")
          event.target.removeAttribute("aria-invalid");
      },
      options,
    );
    this.container.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        if (this.composing) return;
        if (event.target.id === "setup-form") this.startRound();
        if (event.target.id === "answer-form") this.components.round.submit();
      },
      options,
    );
    this.container.addEventListener(
      "compositionstart",
      () => {
        this.composing = true;
      },
      options,
    );
    this.container.addEventListener(
      "compositionend",
      () => {
        this.composing = false;
      },
      options,
    );
    this.container.addEventListener(
      "keydown",
      (event) => {
        if (event.isComposing || this.composing) return;
        if (
          event.key === "Escape" &&
          this.screen === "round" &&
          !this.dialog.open
        )
          this.components.round.pause();
      },
      options,
    );
    // Keep Tab on the two actions even when macOS skips buttons by default.
    this.dialog.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Tab") return;
        event.preventDefault();
        const buttons = [
          ...this.dialog.querySelectorAll("button:not(:disabled)"),
        ];
        const index = buttons.indexOf(document.activeElement);
        buttons[
          (index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length
        ].focus();
      },
      options,
    );
    this.dialog.addEventListener(
      "cancel",
      (event) => {
        event.preventDefault();
        this.resume();
      },
      options,
    );
    window.addEventListener(
      "popstate",
      () => {
        if (this.screen === "round") {
          history.replaceState({}, "", "#round");
          this.components.round.pause();
          return;
        }
        if (this.screen === "countdown") this.countdown.stop();
        this.show(this.readRoute(), { replace: true });
      },
      options,
    );
    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) return;
        if (this.screen === "round") this.components.round.pause();
        else if (this.screen === "countdown") {
          this.countdown.stop();
          this.show("home", { replace: true });
        }
      },
      options,
    );
    window.addEventListener(
      "beforeunload",
      (event) => {
        if (this.components.round.active) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      options,
    );
    // Read once so unavailable storage is explained before the first round.
    getLeaderboard("multiplication_blitz_1");
    this.show(this.readRoute(), { replace: true, focus: false });
  }
  readRoute() {
    const view = location.hash.slice(1).split("?")[0];
    if (view === "progress") {
      const params = new URLSearchParams(location.hash.split("?")[1] || "");
      if (OPERATIONS.some((op) => op.id === params.get("game")))
        this.state.gameType = params.get("game");
      if (MODES.includes(params.get("mode")))
        this.state.mode = params.get("mode");
      if (RANGES[params.get("level")])
        this.state.level = Number(params.get("level"));
      return "progress";
    }
    return view === "results" && this.state.result ? "results" : "home";
  }
  route(screen) {
    if (screen === "countdown" || screen === "round") return "#round";
    if (screen === "progress")
      return `#progress?game=${this.state.gameType}&mode=${this.state.mode}&level=${this.state.level}`;
    return `#${screen}`;
  }
  show(screen, { replace = false, focus = true } = {}) {
    this.screen = screen;
    const url = this.route(screen);
    if (location.hash !== url)
      history[replace ? "replaceState" : "pushState"]({}, "", url);
    this.renderShell();
    this.components[screen].render();
    this.updateStorageStatus();
    if (focus) {
      this.main.focus();
      window.scrollTo(0, 0);
    }
  }
  renderShell() {
    const s = this.state,
      inRound = ["round", "countdown"].includes(this.screen);
    document.documentElement.lang = s.language;
    document.title = `Tablas · ${translate(s.language, this.screen === "progress" ? "progress" : "play")}`;
    document.querySelector(".skip-link").textContent = translate(
      s.language,
      "skip",
    );
    const header = document.querySelector("#header");
    header.classList.toggle("in-round", inRound);
    const logo = `<span class="brandmark" aria-hidden="true">t<span>×</span></span>tablas<span class="branddot">.</span>`;
    header.innerHTML = `${inRound ? `<span class="brand">${logo}</span>` : `<a class="brand" href="#home" aria-label="Tablas · ${text(s, "play")}">${logo}</a>`}
      <nav aria-label="${text(s, "nav")}" ${inRound ? "hidden" : ""}><a href="#home" ${this.screen === "home" ? 'class="active" aria-current="page"' : ""}>${text(s, "play")}</a><a href="#progress" ${this.screen === "progress" ? 'class="active" aria-current="page"' : ""}>${text(s, "progress")}</a></nav>
      <div class="language-switch" role="group" aria-label="${text(s, "language")}" ${inRound ? "hidden" : ""}><button data-lang="en" lang="en" aria-pressed="${s.language === "en"}">English</button><button data-lang="es" lang="es" aria-pressed="${s.language === "es"}">Español</button></div>`;
    document.querySelector("#footer").innerHTML =
      `<span>${text(s, "footer")}</span><span>${text(s, "footerBrand")}</span>`;
  }
  handleClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash !== "#main") {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      this.show(link.hash === "#progress" ? "progress" : "home");
      return;
    }
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.lang) {
      if (!["home", "progress", "results"].includes(this.screen)) return;
      this.state.language = button.dataset.lang;
      this.show(this.screen, { replace: true, focus: false });
      document.querySelector(`[data-lang="${this.state.language}"]`).focus();
    }
    if (button.dataset.group) {
      const { group, value } = button.dataset;
      if (!["home", "progress"].includes(this.screen)) return;
      if (group === "gameType" && OPERATIONS.some((op) => op.id === value))
        this.state.setGameType(value);
      if (group === "mode" && MODES.includes(value)) this.state.setMode(value);
      if (group === "level" && RANGES[value])
        this.state.setLevel(Number(value));
      this.show(this.screen, { replace: true, focus: false });
      this.main
        .querySelector(`[data-group="${group}"][data-value="${value}"]`)
        ?.focus();
    }
    if (button.dataset.key) this.components.round.key(button.dataset.key);
    const actions = {
      start: () => this.startRound(),
      replay: () => {
        Object.assign(this.state, this.state.result.config);
        this.startRound();
      },
      home: () => this.show("home"),
      progress: () => this.show("progress"),
      pause: () => this.components.round.pause(),
      resume: () => this.resume(),
      end: () => {
        this.dialog.close();
        this.components.round.endGame(false);
      },
      cancel: () => {
        this.countdown.stop();
        this.show("home", { replace: true });
      },
    };
    actions[button.dataset.action]?.();
  }
  startRound() {
    if (this.screen === "countdown" || this.components.round.active) return;
    this.state.user = this.state.user?.trim() || null;
    this.show("countdown", { replace: this.screen === "results" });
    this.countdown.start(3);
  }
  openPause() {
    const s = this.state;
    this.dialog.innerHTML = `<div class="pause-icon" aria-hidden="true">Ⅱ</div><h2 id="pause-title">${text(s, "paused")}</h2><p id="pause-description">${text(s, "pausedHint")}</p><button class="primary" data-action="resume" autofocus>${text(s, "resume")} →</button><button class="text-button" data-action="end">${text(s, "end")}</button><p class="small">${text(s, "endHint")}</p>`;
    if (!this.dialog.open) this.dialog.showModal();
    this.dialog.querySelector("[data-action=resume]").focus();
  }
  resume() {
    this.dialog.close();
    this.components.round.resume();
  }
  updateStorageStatus() {
    const el = document.querySelector("#storage-status");
    el.hidden = !storageUnavailable();
    el.textContent = storageUnavailable()
      ? translate(this.state.language, "storageError")
      : "";
  }
  announce(message) {
    document.querySelector("#announcer").textContent = message;
  }
  unmount() {
    this.events.abort();
    this.countdown.stop();
    this.components.round.unmount();
  }
}
