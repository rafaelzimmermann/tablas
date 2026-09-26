// src/generator.js

/**
 * Multiplication Generator
 * Generates multiplication questions (a * b) and ensures no immediate repeats.
 */

export class MultiplicationGenerator {
    constructor(maxFactor = 12) {
        this.maxFactor = maxFactor;
        this.lastQuestion = null;
    }

    /**
     * Generates a new multiplication question.
     * @returns {{a: number, b: number, answer: number}}
     */
    generate() {
        let a, b, answer;
        let questionKey;

        do {
            a = Math.floor(Math.random() * this.maxFactor) + 1;
            b = Math.floor(Math.random() * this.maxFactor) + 1;
            answer = a * b;
            questionKey = `${a}x${b}`;
        } while (questionKey === this.lastQuestion?.key);

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
