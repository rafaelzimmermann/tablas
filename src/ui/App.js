// src/ui/App.js

import { Component } from '../core/Component.js';
import { StartScreenComponent } from './components/StartScreenComponent.js';
import { GameSelectionComponent } from './components/GameSelectionComponent.js';
import { ModeLevelSelectionComponent } from './components/ModeLevelSelectionComponent.js';
import { CountdownComponent } from './components/CountdownComponent.js';
import { GameComponent } from './components/GameComponent.js';
import { ResultsComponent } from './components/ResultsComponent.js';
import { LeaderboardComponent } from './components/LeaderboardComponent.js';

/**
 * The root component that manages high-level transitions between screens.
 */
export class App extends Component {
    constructor(container, gameState) {
        super(container, gameState);
        this.container = container;
        this.gameState = gameState;
        this.components = {};
        this.screens = {
            start: document.getElementById('start-screen'),
            'game-selection-screen': document.getElementById('game-selection-screen'),
            'mode-level-screen': document.getElementById('mode-level-screen'),
            countdown: document.getElementById('countdown-screen'),
            game: document.getElementById('game-screen'),
            results: document.getElementById('results-screen'),
            leaderboard: document.getElementById('leaderboard-screen')
        };
    }

    /**
     * Navigates to a specific screen.
     * @param {string} screenId 
     */
    navigateTo(screenId) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('visible');
        });

        const target = this.screens[screenId];
        if (target) {
            target.classList.add('visible');
        } else {
            console.error(`Screen with ID ${screenId} not found.`);
        }
    }

    mount() {
        // Mount all components that need to exist for their respective screens
        if (this.screens.start) {
            this.components.start = new StartScreenComponent(this.screens.start, this.gameState, this);
            this.components.start.mount();
        }

        if (this.screens['game-selection-screen']) {
            this.components.gameSelection = new GameSelectionComponent(this.screens['game-selection-screen'], this.gameState, this);
            this.components.gameSelection.mount();
        }

        if (this.screens['mode-level-screen']) {
            this.components.modeLevel = new ModeLevelSelectionComponent(this.screens['mode-level-screen'], this.gameState, this);
            this.components.modeLevel.mount();
        }

        if (this.screens.countdown) {
            this.components.countdown = new CountdownComponent(this.screens.countdown, this.gameState, this);
            this.components.countdown.mount();
        }

        if (this.screens.game) {
            this.components.game = new GameComponent(this.screens.game, this.gameState, this);
            this.components.game.mount();
        }

        if (this.screens.results) {
            this.components.results = new ResultsComponent(this.screens.results, this.gameState, this);
            this.components.results.mount();
        }

        if (this.screens.leaderboard) {
            this.components.leaderboard = new LeaderboardComponent(this.screens.leaderboard, this.gameState, this);
            this.components.leaderboard.mount();
        }

        this.unsubscribe = this.gameState.subscribe((state) => {
            // Automatically navigate to countdown if game becomes active via some trigger
            // But currently we use explicit navigateTo calls.
        });
    }

    unmount() {
        if (this.unsubscribe) this.unsubscribe();
        Object.values(this.components).forEach(comp => comp.unmount());
    }

    render() {
        // Not used for top-level in this implementation
    }
}
