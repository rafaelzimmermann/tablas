import test from 'node:test';
import assert from 'node:assert';
import { LearningService } from '../src/logic/LearningService.js';
import { AdditionGenerator } from '../src/logic/generators/AdditionGenerator.js';
import { SubtractionGenerator } from '../src/logic/generators/SubtractionGenerator.js';
import { MultiplicationGenerator } from '../src/logic/generators/MultiplicationGenerator.js';
import { DivisionGenerator } from '../src/logic/generators/DivisionGenerator.js';
import { getCompositeKey, getUser, saveUser } from '../src/data.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; }
    };
})();

globalThis.localStorage = localStorageMock;

test('LearningService', async (t) => {
    await t.test('recordFailure and getPool', async () => {
        localStorage.clear();
        const username = 'testuser';
        const gameType = 'sum';
        const question = { a: 5, b: 3, answer: 8 };

        LearningService.recordFailure(username, gameType, question);

        const pool = LearningService.getPool(username, gameType);
        assert.strictEqual(pool.length, 1);
        assert.strictEqual(pool[0].a, 5);
        assert.strictEqual(pool[0].b, 3);
        assert.strictEqual(pool[0].answer, 8);
        assert.ok(pool[0].timestamp <= Date.now());
    });

    await t.test('getPool returns empty if no failures', async () => {
        localStorage.clear();
        const pool = LearningService.getPool('nonexistent', 'sum');
        assert.strictEqual(pool.length, 0);
    });
});

test('Generators', async (t) => {
    await t.test('AdditionGenerator produces correct sums', async () => {
        const gen = new AdditionGenerator(10);
        for (let i = 0; i < 50; i++) {
            const q = gen.generate();
            assert.strictEqual(q.a + q.b, q.answer);
        }
    });

    await t.test('SubtractionGenerator produces correct differences', async () => {
        const gen = new SubtractionGenerator(10);
        for (let i = 0; i < 50; i++) {
            const q = gen.generate();
            assert.strictEqual(q.a - q.b, q.answer);
        }
    });

    await t.test('MultiplicationGenerator produces correct products', async () => {
        const gen = new MultiplicationGenerator(10);
        for (let i = 0; i < 50; i++) {
            const q = gen.generate();
            assert.strictEqual(q.a * q.b, q.answer);
        }
    });

    await t.test('DivisionGenerator produces correct integer quotients', async () => {
        const gen = new DivisionGenerator(10);
        for (let i = 0; i < 50; i++) {
            const q = gen.generate();
            assert.strictEqual(q.a / q.b, q.answer);
            assert.ok(Number.isInteger(q.answer));
        }
    });

    await t.test('Generator picks from learning pool', async () => {
        const gen = new AdditionGenerator(10);
        const pool = [{ a: 1, b: 1, answer: 2 }];
        
        // Since it's 20% chance, we might need to call it many times to ensure it picks
        let picked = false;
        for (let i = 0; i < 100; i++) {
            const q = gen.generate(pool);
            if (q.isFromLearningPool) {
                picked = true;
                break;
            }
        }
        assert.strictEqual(picked, true, 'Should have picked from learning pool eventually');
    });
});

test('Data Layer helpers', async (t) => {
    await t.test('getCompositeKey', async () => {
        assert.strictEqual(getCompositeKey('sum', 'bullet', 1), 'sum_bullet_1');
    });

    await t.test('saveUser and getUser', async () => {
        localStorage.clear();
        const username = 'alice';
        saveUser(username);
        const user = getUser(username);
        assert.notStrictEqual(user, null);
        assert.strictEqual(user.totalGames, 0);
    });
});
