// src/generator.js

/**
 * Multiplication Generator
 * Generates multiplication questions (a * b) and ensures no immediate repeats.
 */

export class MultiplicationGenerator {
    constructor(maxFactor = 12) {
        this.maxFactor = maxFactor;
        this.lastQuestion = null;
        this.history = new Set();
    }

    /**
     * Generates a new multiplication question.
     * @returns {{a: number, b: number, answer: number}}
     */
    generate() {
        const maxUnique = (this.maxFactor * (this.maxFactor + 1)) / 2;
        if (this.history.size >= maxUnique) {
            this.history.clear();
        }

        let a, b, answer;
        let questionKey;

        do {
            a = Math.floor(Math.random() * this.maxFactor) + 1;
            b = Math.floor(Math.random() * this.maxFactor) + 1;
            answer = a * b;
            const min = Math.min(a, b);
            const max = Math.max(a, b);
            questionKey = `${min}x${max}`;
        } while (this.history.has(questionKey));

        this.history.add(questionKey);
        this.lastQuestion = { key: questionKey, a, b, answer };
        return { a, b, answer };
    }

    /**
     * Resets the generator history.
     */
    reset() {
        this.lastQuestion = null;
    }
}
