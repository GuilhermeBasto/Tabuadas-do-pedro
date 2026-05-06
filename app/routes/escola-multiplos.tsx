import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { usePlayerState } from "~/lib/storage";

const GAME_DURATION = 30;
const START_LIVES = 3;
const GRID_SIZE = 12;

type Cell = { id: number; n: number };

function genNumber(tabuada: number): number {
  if (Math.random() < 0.5) {
    return tabuada * (Math.floor(Math.random() * 10) + 1);
  }
  let n: number;
  do {
    n = Math.floor(Math.random() * 50) + 1;
  } while (n % tabuada === 0);
  return n;
}

function genCells(tabuada: number, startId = 0): Cell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: startId + i,
    n: genNumber(tabuada),
  }));
}

export default function EscolaMultiplos() {
  const navigate = useNavigate();
  const { update } = usePlayerState();
  const [tabuada, setTabuada] = useState<number | null>(null);

  if (tabuada === null) {
    return <PickTabuada onPick={setTabuada} onBack={() => navigate("/escola")} />;
  }

  return (
    <GameRound
      tabuada={tabuada}
      onExit={() => navigate("/escola")}
      onAgain={() => setTabuada(null)}
      onWin={(score) => {
        const reward = score;
        if (reward > 0) {
          update((s) => ({ ...s, coins: s.coins + reward }));
        }
      }}
    />
  );
}

function PickTabuada({
  onPick,
  onBack,
}: {
  onPick: (n: number) => void;
  onBack: () => void;
}) {
  return (
    <Screen>
      <TopBar
        title="CAÇA AOS MÚLTIPLOS"
        onBack={() => {
          sfx.click();
          onBack();
        }}
      />

      <p className="my-2.5 text-center font-[family-name:var(--font-pixel)] text-xs text-pixel-blue">
        ESCOLHE A TABUADA
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-2.5">
        {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
          <button
            key={n}
            onClick={() => {
              sfx.click();
              onPick(n);
            }}
            className="
              pixel-btn flex aspect-square items-center justify-center
              bg-pixel-red p-4 px-2 text-lg text-white
            "
          >
            {n}×
          </button>
        ))}
      </div>

      <div
        className="
          mt-3 border-[3px] border-pixel-gold bg-pixel-dark p-3 text-center
          font-[family-name:var(--font-pixel)] text-[9px] leading-relaxed text-pixel-gold
          shadow-pixel
        "
      >
        💡 TOCA APENAS<br />NOS MÚLTIPLOS!
      </div>
    </Screen>
  );
}

function GameRound({
  tabuada,
  onExit,
  onAgain,
  onWin,
}: {
  tabuada: number;
  onExit: () => void;
  onAgain: () => void;
  onWin: (score: number) => void;
}) {
  const idCounter = useRef(GRID_SIZE);
  const [cells, setCells] = useState<Cell[]>(() => genCells(tabuada));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [shakeKey, setShakeKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  // Tick the timer every second; effects detect game-over via lives/timeLeft.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Detect end-of-game in an effect so we never call setState on the parent
  // (via onWin) inside another component's render/updater.
  useEffect(() => {
    if (finishedRef.current) return;
    if (lives > 0 && timeLeft > 0) return;
    finishedRef.current = true;
    setFinished(true);
    onWin(score);
    sfx.star();
  }, [lives, timeLeft, score, onWin]);

  function handleTap(idx: number) {
    if (finishedRef.current) return;
    const cell = cells[idx];
    const isMultiple = cell.n % tabuada === 0;

    if (isMultiple) {
      sfx.coin();
      setScore((s) => s + 1);
    } else {
      sfx.wrong();
      setShakeKey((k) => k + 1);
      setLives((l) => Math.max(0, l - 1));
    }

    setCells((prev) => {
      const next = [...prev];
      next[idx] = { id: idCounter.current++, n: genNumber(tabuada) };
      return next;
    });
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        tabuada={tabuada}
        onAgain={onAgain}
        onExit={onExit}
      />
    );
  }

  return (
    <Screen>
      <TopBar
        title={`× ${tabuada}`}
        onBack={() => {
          sfx.click();
          onExit();
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <Hud icon="⏱️" value={timeLeft} color="text-pixel-blue" />
        <Hud icon="🎯" value={score} color="text-pixel-gold" />
        <Hud icon="❤️" value={lives} color="text-pixel-red" />
      </div>

      <p className="text-center font-[family-name:var(--font-pixel)] text-[10px] text-pixel-green">
        TOCA NOS MÚLTIPLOS DE {tabuada}
      </p>

      <div
        key={shakeKey}
        className="grid grid-cols-3 gap-2 animate-wrong-shake"
        style={{ animationName: shakeKey === 0 ? "none" : undefined }}
      >
        {cells.map((cell, idx) => (
          <button
            key={cell.id}
            onClick={() => handleTap(idx)}
            className="
              pixel-btn aspect-square bg-pixel-purple text-2xl text-white
              flex items-center justify-center
            "
          >
            {cell.n}
          </button>
        ))}
      </div>
    </Screen>
  );
}

function Hud({
  icon,
  value,
  color,
}: {
  icon: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`
        flex flex-1 items-center justify-center gap-2 border-[3px]
        border-pixel-dark bg-pixel-dark px-2 py-2.5
        font-[family-name:var(--font-pixel)] text-xs shadow-pixel ${color}
      `}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="leading-none">{value}</span>
    </div>
  );
}

function ResultScreen({
  score,
  tabuada,
  onAgain,
  onExit,
}: {
  score: number;
  tabuada: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const title =
    score >= 30
      ? "FANTÁSTICO!"
      : score >= 15
      ? "MUITO BEM!"
      : score >= 5
      ? "BOM TRABALHO!"
      : "TENTA OUTRA VEZ!";
  const emoji =
    score >= 30 ? "🌟" : score >= 15 ? "🎉" : score >= 5 ? "👍" : "💪";

  return (
    <Screen>
      <div className="flex flex-col items-center gap-5 pt-6 text-center">
        <div className="animate-result-pop text-7xl">{emoji}</div>
        <h2 className="font-[family-name:var(--font-pixel)] text-lg text-pixel-gold text-shadow-pixel">
          {title}
        </h2>
        <div className="font-[family-name:var(--font-pixel)] text-xs text-pixel-blue">
          TABUADA DO {tabuada}
        </div>
        <div
          className="
            border-[3px] border-pixel-gold bg-pixel-dark px-6 py-4
            font-[family-name:var(--font-pixel)] text-base text-pixel-gold shadow-pixel
          "
        >
          🎯 {score} ACERTOS
        </div>
        <div
          className="
            border-[3px] border-pixel-gold bg-pixel-dark px-6 py-3
            font-[family-name:var(--font-pixel)] text-sm text-pixel-gold shadow-pixel
          "
        >
          🪙 +{score} MOEDAS
        </div>

        <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={() => {
              sfx.click();
              onAgain();
            }}
            className="pixel-btn bg-pixel-green px-5 py-4 text-sm text-white"
          >
            OUTRA VEZ
          </button>
          <button
            onClick={() => {
              sfx.click();
              onExit();
            }}
            className="pixel-btn bg-pixel-red px-5 py-4 text-sm text-white"
          >
            VOLTAR
          </button>
        </div>
      </div>
    </Screen>
  );
}
