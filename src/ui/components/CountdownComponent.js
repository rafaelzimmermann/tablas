// src/ui/components/CountdownComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';

export class CountdownComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
        this.countdown = 5;
    }

    mount() {
        super.mount();
        this.startCountdown();
    }

    startCountdown() {
        this.countdown = 5;
        this.render();

        const interval = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(interval);
                this.gameState.setIsGameActive(true);
                this.app.navigateTo('game');
            } else {
                this.render();
            }
        }, 1000);
    }

    render() {
        this.clear();
        const display = document.createElement('div');
        display.id = 'countdown-display';
        display.textContent = this.countdown;
        this.container.appendChild(display);
    }
}
