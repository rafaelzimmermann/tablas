// src/logic/BaseGenerator.js

/**
 * Abstract base class for all math generators.
 */
export class BaseGenerator {
    /**
     * @param {number} maxRange The upper bound for number generation.
     */
    constructor(maxRange) {
        if (this.constructor === BaseGenerator) {
            throw new Error("BaseGenerator is abstract and cannot be instantiated directly.");
        }
        this.maxRange = maxRange;
        this.history = new Set();
    }

    /**
     * Generates a new question.
     * @param {Array} learningPool Array of previously failed questions.
     * @returns {{a: number, b: number, answer: number, type: string}}
     */
    generate(learningPool = []) {
        // 20% chance to use a question from the learning pool if available
        if (learningPool.length > 0 && Math.random() < 0.2) {
            const failedQuestion = learningPool[Math.floor(Math.random() * learningPool.length)];
            // We return the failed question, but we don't add it to this session's history 
            // to avoid infinite loops if they keep failing it (the weight is already low)
            return {
                ...failedQuestion,
                isFromLearningPool: true
            };
        }

        return this._generateRandomQuestion();
    }

    /**
     * Internal method to generate a random question.
     * Must be implemented by subclasses.
     * @returns {{a: number, b: number, answer: number}}
     */
    _generateRandomQuestion() {
        throw new Error("Method '_generateRandomQuestion()' must be implemented.");
    }

    /**
     * Helper to create a unique key for a question to avoid immediate repeats.
     * @param {number} a 
     * @param {number} b 
     * @returns {string}
     */
    _createQuestionKey(a, b) {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        return `${min}_${max}`;
    }
}
