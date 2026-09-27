// src/core/Component.js

/**
 * Base class for all UI components.
 */
export class Component {
    /**
     * @param {HTMLElement} container The DOM element where the component will be rendered.
     * @param {GameState} gameState The central game state.
     */
    constructor(container, gameState) {
        this.container = container;
        this.gameState = gameState;
        this.unsubscribe = null;
    }

    /**
     * Lifecycle method called when component is added to the DOM.
     */
    mount() {
        this.unsubscribe = this.gameState.subscribe(() => this.render());
        this.render();
    }

    /**
     * Lifecycle method called when component is removed from the DOM.
     */
    unmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    /**
     * Renders the component's HTML into its container.
     * Should be overridden by subclasses.
     */
    render() {
        // To be implemented by subclasses
    }

    /**
     * Helper to clear the container before re-rendering.
     */
    clear() {
        this.container.innerHTML = '';
    }
}
