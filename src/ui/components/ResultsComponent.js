// src/ui/components/ResultsComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';
import { getUser, getCompositeKey } from '../../data.js';

export class ResultsComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
    }

    mount() {
        super.mount();
    }

    activate() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const restartBtn = this.container.querySelector('#restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.gameState.reset();
                this.app.navigateTo('start-screen');
            });
        }

        const leaderboardBtn = this.container.querySelector('#leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.app.navigateTo('leaderboard');
            });
        }

        // Check for new record
        this.checkNewRecord();
    }

    checkNewRecord() {
        const { user, gameType, mode, level, score } = this.gameState;
        const compositeKey = getCompositeKey(gameType, mode, level);
        const userData = getUser(user);
        
        const msgElement = this.container.querySelector('#new-record-msg');
        if (msgElement) {
            if (userData && score > (userData.highScores[compositeKey] || 0)) {
                msgElement.classList.remove('hidden');
            } else {
                msgElement.classList.add('hidden');
            }
        }
    }

    render() {
        // HTML is already in index.html
    }
}
