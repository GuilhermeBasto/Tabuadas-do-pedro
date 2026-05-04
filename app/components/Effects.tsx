import { useEffect, useState } from "react";

type Coin = {
  id: number;
  x: number;
  y: number;
};

type Confetti = {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
};

const CONFETTI_COLORS = [
  "#ffd700",
  "#ff3b3b",
  "#4ade80",
  "#38bdf8",
  "#a855f7",
  "#ec4899",
];

let _coinId = 0;
let _confettiId = 0;

/**
 * useEffects — imperative hooks to spawn ephemeral animations.
 * Returns the React nodes to render plus spawn callbacks.
 */
export function useEffects() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  // Auto-cleanup expired coins
  useEffect(() => {
    if (coins.length === 0) return;
    const t = setTimeout(() => setCoins([]), 1000);
    return () => clearTimeout(t);
  }, [coins]);

  useEffect(() => {
    if (confetti.length === 0) return;
    const t = setTimeout(() => setConfetti([]), 2600);
    return () => clearTimeout(t);
  }, [confetti]);

  function spawnCoin(fromEl: HTMLElement) {
    const r = fromEl.getBoundingClientRect();
    setCoins((cs) => [
      ...cs,
      { id: ++_coinId, x: r.left + r.width / 2, y: r.top + r.height / 2 },
    ]);
  }

  function spawnConfetti() {
    const next: Confetti[] = [];
    for (let i = 0; i < 50; i++) {
      next.push({
        id: ++_confettiId,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random(),
      });
    }
    setConfetti(next);
  }

  const nodes = (
    <>
      {coins.map((c) => (
        <div
          key={c.id}
          className="pointer-events-none fixed z-[200] text-3xl animate-coin-fly"
          style={{ left: c.x, top: c.y }}
        >
          🪙
        </div>
      ))}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="pointer-events-none fixed z-[150] h-2.5 w-2.5"
          style={{
            left: `${c.x}vw`,
            background: c.color,
            animation: `confetti-fall ${c.duration}s linear ${c.delay}s forwards`,
          }}
        />
      ))}
    </>
  );

  return { nodes, spawnCoin, spawnConfetti };
}
