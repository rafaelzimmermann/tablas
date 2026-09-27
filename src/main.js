// src/main.js

import { gameState } from './core/GameState.js';
import { App } from './ui/App.js';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    const app = new App(appContainer, gameState);
    app.mount();
    console.log('Math Games Suite initialized.');
});
