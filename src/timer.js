// src/timer.js

export const TIMER_MODES = {
    bullet: { label: 'Bullet', duration: 30 },
    blitz: { label: 'Blitz', duration: 60 },
    rapid: { label: 'Rapid', duration: 120 }
};

export class Timer {
    constructor(onTick, onComplete) {
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.timeLeft = 0;
        this.intervalId = null;
    }

    start(duration) {
        this.stop();
        this.timeLeft = duration;
        this.onTick(this.timeLeft);

        this.intervalId = setInterval(() => {
            this.timeLeft -= 1;
            if (this.timeLeft <= 0) {
                this.stop();
                this.onComplete();
            } else {
                this.onTick(this.timeLeft);
            }
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getTimeLeft() {
        return this.timeLeft;
    }
}
