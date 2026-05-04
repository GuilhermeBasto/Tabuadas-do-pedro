import type { GameMode } from "./constants";

export type Question = {
  a: number;
  b: number;
  correct: number;
  options: number[];
};

export type GameSession = {
  mode: GameMode;
  tabuada: number; // 0 = mixed
  total: number;
  lives: number;
  timeLimit: number | null;
  bossEndTime: number | null;
  bossHp: number; // remaining HP (boss mode only; 0 in other modes)
  bossMaxHp: number;
  current: number;
  score: number;
  correct: number;
  wrong: number;
  history: { a: number; b: number }[]; // wrong answers to replay
  q: Question | null;
  answered: boolean;
  finished: boolean;
};

export type GameOptions = {
  mode: GameMode;
  tabuada: number;
  total: number;
  lives: number;
  timeLimit?: number | null;
  bossHp?: number;
};

export function newGame(opts: GameOptions): GameSession {
  const isBoss = opts.mode === "boss";
  return {
    mode: opts.mode,
    tabuada: opts.tabuada,
    total: opts.total,
    lives: opts.lives,
    timeLimit: opts.timeLimit ?? null,
    bossEndTime:
      isBoss && opts.timeLimit ? Date.now() + opts.timeLimit * 1000 : null,
    bossHp: isBoss ? opts.bossHp ?? 6 : 0,
    bossMaxHp: isBoss ? opts.bossHp ?? 6 : 0,
    current: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    history: [],
    q: null,
    answered: false,
    finished: false,
  };
}

export function makeQuestion(g: GameSession): Question {
  let a: number;
  let b: number;

  if (g.tabuada > 0) {
    a = g.tabuada;
    b = Math.floor(Math.random() * 10) + 1;
  } else {
    a = Math.floor(Math.random() * 9) + 2; // 2..10
    b = Math.floor(Math.random() * 10) + 1;
  }

  // 30% chance to repeat a previous wrong answer (spaced repetition)
  if (g.history.length && Math.random() < 0.3) {
    const w = g.history[Math.floor(Math.random() * g.history.length)];
    a = w.a;
    b = w.b;
  }

  const correct = a * b;
  const options = new Set([correct]);
  while (options.size < 4) {
    const delta =
      (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
    let opt = correct + delta;
    if (opt < 0) opt = correct + Math.abs(delta) + a;
    if (opt !== correct && opt > 0) options.add(opt);
  }

  const arr = Array.from(options).sort(() => Math.random() - 0.5);
  return { a, b, correct, options: arr };
}

export type EndResult = {
  stars: number;
  title: string;
  emoji: string;
  accuracy: number;
  bossWin?: boolean;
};

export function computeEndResult(g: GameSession): EndResult {
  const total = g.correct + g.wrong;
  const accuracy = total > 0 ? g.correct / total : 0;

  if (g.mode === "adventure") {
    if (accuracy >= 0.95) return { stars: 3, title: "PERFEITO!", emoji: "🌟", accuracy };
    if (accuracy >= 0.75) return { stars: 2, title: "MUITO BEM!", emoji: "🎉", accuracy };
    if (accuracy >= 0.5) return { stars: 1, title: "BOM TRABALHO!", emoji: "👍", accuracy };
    return { stars: 0, title: "QUASE!", emoji: "💪", accuracy };
  }

  if (g.mode === "boss") {
    const bossWin = g.bossMaxHp > 0 && g.bossHp <= 0;
    return {
      stars: 0,
      title: bossWin ? "BOSS DERROTADO!" : "DERROTA...",
      emoji: bossWin ? "👑" : "💀",
      accuracy,
      bossWin,
    };
  }

  if (g.mode === "endless") {
    return { stars: 0, title: "MARATONA!", emoji: "♾️", accuracy };
  }

  return { stars: 0, title: "TREINO COMPLETO!", emoji: "🎯", accuracy };
}
