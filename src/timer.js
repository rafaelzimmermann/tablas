export const TIMER_MODES = {
  bullet: { label: "30 seconds", duration: 30 },
  blitz: { label: "1 minute", duration: 60 },
  rapid: { label: "2 minutes", duration: 120 },
};
// Use a deadline rather than counting intervals, so a busy tab cannot extend a round.
export class Timer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.remaining = 0;
    this.deadline = 0;
    this.running = false;
    this.lastDisplayed = null;
  }
  start(duration) {
    this.stop();
    this.remaining = duration * 1000;
    this.lastDisplayed = null;
    this.resume();
  }
  resume() {
    if (this.running || this.remaining <= 0) return;
    this.running = true;
    this.deadline = Date.now() + this.remaining;
    this.tick();
    if (this.running) this.intervalId = setInterval(() => this.tick(), 100);
  }
  tick() {
    if (!this.running) return;
    const left = this.getTimeLeft();
    if (left !== this.lastDisplayed) {
      this.lastDisplayed = left;
      this.onTick(left);
    }
    if (left <= 0) {
      this.stop();
      this.remaining = 0;
      this.onComplete();
    }
  }
  pause() {
    if (!this.running) return;
    this.remaining = Math.max(0, this.deadline - Date.now());
    this.stop();
  }
  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
  }
  getTimeLeft() {
    return Math.ceil(
      (this.running
        ? Math.max(0, this.deadline - Date.now())
        : this.remaining) / 1000,
    );
  }
}
