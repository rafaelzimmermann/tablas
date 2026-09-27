import test from "node:test";
import assert from "node:assert/strict";
import { Timer } from "../src/timer.js";
import {
  saveScore,
  getUser,
  getLeaderboard,
  recordError,
  getLearningPool,
} from "../src/data.js";
import { TRANSLATIONS } from "../src/ui/translations.js";
let values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};

test("same round commits only once and keeps legacy category scores", () => {
  saveScore("Alex", 3, "multiplication_blitz_1", "round-1");
  saveScore("Alex", 3, "multiplication_blitz_1", "round-1");
  assert.equal(getUser("Alex").totalGames, 1);
  assert.equal(getLeaderboard("multiplication_blitz_1").length, 1);
  saveScore("Alex", 5, "multiplication_blitz_1", "round-2");
  assert.equal(getUser("Alex").highScores.multiplication_blitz_1, 5);
  assert.equal(getUser("Alex").totalGames, 2);
});
test("guest sessions never write a null profile or learning history", () => {
  const before = JSON.stringify([...values]);
  saveScore(null, 3, "sum_blitz_1");
  recordError(null, "sum", { a: 1, b: 2, answer: 3 });
  assert.deepEqual(getLearningPool(null, "sum"), []);
  assert.equal(JSON.stringify([...values]), before);
});
test("special property names are safe player nicknames", () => {
  saveScore("__proto__", 2, "sum_blitz_1", "special");
  assert.equal(getUser("__proto__").highScores.sum_blitz_1, 2);
  assert.equal({}.highScores, undefined);
});
test("timer uses elapsed time, freezes when paused, and completes once", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  let completed = 0;
  const timer = new Timer(
    () => {},
    () => completed++,
  );
  timer.start(30);
  t.mock.timers.tick(5000);
  assert.equal(timer.getTimeLeft(), 25);
  timer.pause();
  t.mock.timers.tick(60000);
  assert.equal(timer.getTimeLeft(), 25);
  timer.resume();
  t.mock.timers.tick(25000);
  assert.equal(completed, 1);
  t.mock.timers.tick(10000);
  assert.equal(completed, 1);
});
test("Spanish covers every English message and placeholder", () => {
  assert.deepEqual(
    Object.keys(TRANSLATIONS.es).sort(),
    Object.keys(TRANSLATIONS.en).sort(),
  );
  for (const key of Object.keys(TRANSLATIONS.en)) {
    assert.deepEqual(
      TRANSLATIONS.en[key].match(/\{\w+\}/g),
      TRANSLATIONS.es[key].match(/\{\w+\}/g),
      key,
    );
  }
});
