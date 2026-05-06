import { useState } from "react";
import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { usePlayerState } from "~/lib/storage";

const TOTAL_ROUNDS = 8;

type BallColor = "red" | "green";
type Answer = "impossivel" | "possivel" | "certo";

type Round = {
  balls: BallColor[];
  questionColor: BallColor;
  answer: Answer;
};

const COLOR_LABELS: Record<BallColor, string> = {
  red: "VERMELHA",
  green: "VERDE",
};

const COLOR_EMOJI: Record<BallColor, string> = {
  red: "🔴",
  green: "🟢",
};

function genRound(): Round {
  const total = 5 + Math.floor(Math.random() * 3);
  const r = Math.random();
  let redCount: number;
  if (r < 0.33) redCount = 0;
  else if (r < 0.66) redCount = total;
  else redCount = 1 + Math.floor(Math.random() * (total - 1));

  const balls: BallColor[] = [
    ...Array<BallColor>(redCount).fill("red"),
    ...Array<BallColor>(total - redCount).fill("green"),
  ].sort(() => Math.random() - 0.5);

  const questionColor: BallColor = Math.random() < 0.5 ? "red" : "green";
  const matchCount = balls.filter((b) => b === questionColor).length;
  const answer: Answer =
    matchCount === 0 ? "impossivel" : matchCount === total ? "certo" : "possivel";

  return { balls, questionColor, answer };
}

const ANSWER_OPTIONS: { value: Answer; label: string; bg: string; emoji: string }[] = [
  { value: "impossivel", label: "IMPOSSÍVEL", bg: "bg-pixel-red", emoji: "🚫" },
  { value: "possivel", label: "POSSÍVEL", bg: "bg-pixel-orange", emoji: "🤔" },
  { value: "certo", label: "CERTO", bg: "bg-pixel-green", emoji: "✅" },
];

export default function EscolaProbabilidades() {
  const navigate = useNavigate();
  const { update } = usePlayerState();

  const [round, setRound] = useState<Round>(() => genRound());
  const [roundIdx, setRoundIdx] = useState(1);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [finished, setFinished] = useState(false);

  function pick(value: Answer) {
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
    }, 1100);
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
        title="SACO DA SORTE"
        onBack={() => {
          sfx.click();
          navigate("/escola");
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <Hud icon="🎲" label={`${roundIdx}/${TOTAL_ROUNDS}`} />
        <Hud icon="✅" label={`${score}`} />
      </div>

      <Bag balls={round.balls} />

      <div
        className="
          border-[3px] border-pixel-gold bg-pixel-dark p-4 text-center
          font-[family-name:var(--font-pixel)] text-[11px] leading-relaxed text-pixel-gold
          shadow-pixel
        "
      >
        TIRAR UMA BOLA<br />
        <span className="text-pixel-blue">{COLOR_LABELS[round.questionColor]}</span> É...
      </div>

      <div className="flex flex-col gap-3">
        {ANSWER_OPTIONS.map((opt) => {
          const isPicked = picked === opt.value;
          const isCorrect = opt.value === round.answer;
          const showCorrect = picked !== null && isCorrect;
          const showWrong = isPicked && !isCorrect;
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              disabled={picked !== null}
              className={`
                pixel-btn flex items-center justify-center gap-3 px-4 py-4
                text-sm text-white
                ${showCorrect ? "bg-pixel-green" : ""}
                ${showWrong ? "bg-pixel-red opacity-90" : ""}
                ${picked === null ? opt.bg : ""}
                ${picked !== null && !isPicked && !isCorrect ? "bg-[#444] opacity-60" : ""}
              `}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

function Bag({ balls }: { balls: BallColor[] }) {
  return (
    <div
      className="
        relative flex flex-wrap items-center justify-center gap-2
        border-[5px] border-pixel-gold bg-[#3b2418] p-5 shadow-pixel-lg
      "
      style={{ minHeight: 130 }}
    >
      <div
        className="
          absolute -top-3 left-1/2 -translate-x-1/2
          border-[3px] border-pixel-dark bg-pixel-gold px-3 py-1
          font-[family-name:var(--font-pixel)] text-[9px] text-pixel-dark
        "
      >
        🎒 SACO
      </div>
      {balls.map((b, i) => (
        <span key={i} className="text-3xl leading-none">
          {COLOR_EMOJI[b]}
        </span>
      ))}
    </div>
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
      ? "MESTRE DA SORTE!"
      : ratio >= 0.7
      ? "MUITO BEM!"
      : ratio >= 0.4
      ? "BOM TRABALHO!"
      : "TENTA OUTRA VEZ!";
  const emoji =
    ratio >= 0.95 ? "🍀" : ratio >= 0.7 ? "🎉" : ratio >= 0.4 ? "👍" : "💪";

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
