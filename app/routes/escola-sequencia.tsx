import { useState } from "react";
import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { usePlayerState } from "~/lib/storage";

const TOTAL_ROUNDS = 10;
const SEQUENCE_LENGTH = 6;

type Round = {
  terms: number[];
  missingIdx: number;
  answer: number;
  options: number[];
  rule: string;
};

type Step =
  | { type: "add"; delta: number; label: string }
  | { type: "mul"; factor: number; label: string };

const STEPS: Step[] = [
  { type: "add", delta: 2, label: "+2" },
  { type: "add", delta: 3, label: "+3" },
  { type: "add", delta: 5, label: "+5" },
  { type: "add", delta: 10, label: "+10" },
  { type: "add", delta: 50, label: "+50" },
  { type: "add", delta: 100, label: "+100" },
  { type: "mul", factor: 2, label: "×2" },
];

function applyStep(n: number, step: Step): number {
  return step.type === "add" ? n + step.delta : n * step.factor;
}

function genRound(): Round {
  const step = STEPS[Math.floor(Math.random() * STEPS.length)];

  let start: number;
  if (step.type === "mul") {
    start = [1, 2, 3][Math.floor(Math.random() * 3)];
  } else if (step.delta >= 50) {
    start = (Math.floor(Math.random() * 5) + 1) * 50;
  } else {
    start = Math.floor(Math.random() * 10) + 1;
  }

  const terms: number[] = [start];
  for (let i = 1; i < SEQUENCE_LENGTH; i++) {
    terms.push(applyStep(terms[i - 1], step));
  }

  const missingIdx = Math.floor(Math.random() * (SEQUENCE_LENGTH - 2)) + 1;
  const answer = terms[missingIdx];

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const delta =
      step.type === "add" ? step.delta : Math.max(2, Math.floor(answer / 4));
    const nudge = (Math.floor(Math.random() * 3) + 1) * delta;
    const sign = Math.random() < 0.5 ? -1 : 1;
    const candidate = answer + nudge * sign;
    if (candidate > 0 && candidate !== answer) {
      options.add(candidate);
    }
  }

  return {
    terms,
    missingIdx,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    rule: step.label,
  };
}

export default function EscolaSequencia() {
  const navigate = useNavigate();
  const { update } = usePlayerState();

  const [round, setRound] = useState<Round>(() => genRound());
  const [roundIdx, setRoundIdx] = useState(1);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  function pick(value: number) {
    if (picked !== null) return;
    setPicked(value);
    const ok = value === round.answer;
    if (ok) {
      sfx.correct();
      setScore((s) => s + 1);
    } else {
      sfx.wrong();
    }

    window.setTimeout(() => {
      if (roundIdx >= TOTAL_ROUNDS) {
        const reward = (ok ? score + 1 : score) * 2;
        if (reward > 0) {
          update((s) => ({ ...s, coins: s.coins + reward }));
        }
        setFinished(true);
        sfx.star();
      } else {
        setRound(genRound());
        setRoundIdx((r) => r + 1);
        setPicked(null);
      }
    }, 950);
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={TOTAL_ROUNDS}
        coinsEarned={score * 2}
        onAgain={() => {
          setRound(genRound());
          setRoundIdx(1);
          setScore(0);
          setPicked(null);
          setFinished(false);
        }}
        onExit={() => navigate("/escola")}
      />
    );
  }

  return (
    <Screen>
      <TopBar
        title="NÚMERO EM FALTA"
        onBack={() => {
          sfx.click();
          navigate("/escola");
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <Hud icon="🔢" label={`${roundIdx}/${TOTAL_ROUNDS}`} />
        <Hud icon="✅" label={`${score}`} />
      </div>

      <p className="text-center font-[family-name:var(--font-pixel)] text-[10px] text-pixel-blue">
        QUE NÚMERO FALTA?
      </p>

      <div
        className="
          flex flex-wrap items-center justify-center gap-2 border-[3px]
          border-pixel-gold bg-pixel-dark p-4 shadow-pixel
        "
      >
        {round.terms.map((n, i) => {
          const hidden = i === round.missingIdx;
          return (
            <div
              key={i}
              className={`
                flex h-14 w-14 items-center justify-center border-[3px]
                font-[family-name:var(--font-pixel)] text-base
                ${
                  hidden
                    ? picked !== null
                      ? picked === round.answer
                        ? "border-pixel-green bg-pixel-green text-white"
                        : "border-pixel-red bg-pixel-red text-white"
                      : "border-pixel-gold bg-pixel-deep text-pixel-gold"
                    : "border-pixel-blue bg-pixel-deep text-white"
                }
              `}
            >
              {hidden ? (picked !== null ? round.answer : "?") : n}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt) => {
          const isPicked = picked === opt;
          const isAnswer = opt === round.answer;
          const showCorrect = picked !== null && isAnswer;
          const showWrong = isPicked && !isAnswer;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={picked !== null}
              className={`
                pixel-btn px-4 py-5 text-lg text-white
                ${showCorrect ? "bg-pixel-green" : ""}
                ${showWrong ? "bg-pixel-red" : ""}
                ${picked === null ? "bg-pixel-purple" : ""}
                ${picked !== null && !isPicked && !isAnswer ? "bg-[#444] opacity-60" : ""}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

function Hud({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      className="
        flex flex-1 items-center justify-center gap-2 border-[3px]
        border-pixel-dark bg-pixel-dark px-2 py-2.5
        font-[family-name:var(--font-pixel)] text-xs text-pixel-gold shadow-pixel
      "
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="leading-none">{label}</span>
    </div>
  );
}

function ResultScreen({
  score,
  total,
  coinsEarned,
  onAgain,
  onExit,
}: {
  score: number;
  total: number;
  coinsEarned: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const ratio = score / total;
  const title =
    ratio >= 0.95
      ? "GÉNIO DOS NÚMEROS!"
      : ratio >= 0.7
      ? "MUITO BEM!"
      : ratio >= 0.4
      ? "BOM TRABALHO!"
      : "TENTA OUTRA VEZ!";
  const emoji =
    ratio >= 0.95 ? "🧠" : ratio >= 0.7 ? "🎉" : ratio >= 0.4 ? "👍" : "💪";

  return (
    <Screen>
      <div className="flex flex-col items-center gap-5 pt-6 text-center">
        <div className="animate-result-pop text-7xl">{emoji}</div>
        <h2 className="font-[family-name:var(--font-pixel)] text-lg text-pixel-gold text-shadow-pixel">
          {title}
        </h2>
        <div
          className="
            border-[3px] border-pixel-gold bg-pixel-dark px-6 py-4
            font-[family-name:var(--font-pixel)] text-base text-pixel-gold shadow-pixel
          "
        >
          ✅ {score}/{total}
        </div>
        <div
          className="
            border-[3px] border-pixel-gold bg-pixel-dark px-6 py-3
            font-[family-name:var(--font-pixel)] text-sm text-pixel-gold shadow-pixel
          "
        >
          🪙 +{coinsEarned} MOEDAS
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
