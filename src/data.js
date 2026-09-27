// Keep the established localStorage keys and score category format.
const KEYS = {
  users: "math_game_users",
  scores: "math_game_leaderboard",
  learning: "math_game_learning_data",
};
const memory = new Map();
const unavailable = new Set();
let storageFailed = false;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function read(key, fallback) {
  if (unavailable.has(key)) return memory.get(key) ?? fallback;
  try {
    const raw = localStorage.getItem(key);
    const value = raw === null ? fallback : JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) !== Array.isArray(fallback)
    )
      throw new Error("Invalid saved data");
    memory.set(key, value);
    return value;
  } catch {
    // Do not overwrite corrupt data. Keep this visit playable in memory.
    unavailable.add(key);
    storageFailed = true;
    return memory.get(key) ?? fallback;
  }
}
function write(key, value) {
  memory.set(key, value);
  if (unavailable.has(key)) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    unavailable.add(key);
    storageFailed = true;
  }
}
export function storageUnavailable() {
  return storageFailed;
}
export function getUser(username) {
  if (!username) return null;
  const users = read(KEYS.users, {});
  const user = own(users, username) ? users[username] : null;
  return user && typeof user.highScores === "object" && user.highScores !== null
    ? user
    : null;
}
export function saveUser(username) {
  if (!username) return;
  const users = read(KEYS.users, {});
  if (!getUser(username)) {
    Object.defineProperty(users, username, {
      value: { totalGames: 0, highScores: {} },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    write(KEYS.users, users);
  }
}
export function getCompositeKey(gameType, mode, level) {
  return `${gameType}_${mode}_${level}`;
}
export function saveScore(username, score, compositeKey, roundId = null) {
  if (!username || !Number.isInteger(score) || score < 0) return;
  saveUser(username);
  const scores = read(KEYS.scores, []);
  if (!roundId || !scores.some((entry) => entry?.roundId === roundId)) {
    scores.push({
      username,
      score,
      compositeKey,
      timestamp: Date.now(),
      ...(roundId ? { roundId } : {}),
    });
    write(KEYS.scores, scores.slice(-500));
  }
  const users = read(KEYS.users, {});
  const user = users[username];
  const recorded = Array.isArray(user.recordedRounds)
    ? user.recordedRounds
    : [];
  if (roundId && recorded.includes(roundId)) return;
  user.totalGames = (Number(user.totalGames) || 0) + 1;
  user.highScores[compositeKey] = Math.max(
    Number(user.highScores[compositeKey]) || 0,
    score,
  );
  if (roundId) user.recordedRounds = [...recorded, roundId].slice(-500);
  write(KEYS.users, users);
}
export function getLeaderboard(compositeKey) {
  return read(KEYS.scores, [])
    .filter(
      (entry) =>
        entry &&
        typeof entry.username === "string" &&
        entry.compositeKey === compositeKey &&
        Number.isInteger(entry.score) &&
        entry.score >= 0,
    )
    .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
    .slice(0, 10);
}
export function recordError(username, gameType, { a, b, answer }) {
  if (!username) return;
  const data = read(KEYS.learning, {});
  if (
    !own(data, username) ||
    !data[username] ||
    typeof data[username] !== "object"
  ) {
    Object.defineProperty(data, username, {
      value: {},
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const pool = Array.isArray(data[username][gameType])
    ? data[username][gameType]
    : [];
  data[username][gameType] = [
    ...pool,
    { a, b, answer, timestamp: Date.now() },
  ].slice(-50);
  write(KEYS.learning, data);
}
export function getLearningPool(username, gameType) {
  if (!username) return [];
  const data = read(KEYS.learning, {});
  const pool = own(data, username) ? data[username]?.[gameType] : [];
  return Array.isArray(pool)
    ? pool.filter((q) => q && [q.a, q.b, q.answer].every(Number.isFinite))
    : [];
}
