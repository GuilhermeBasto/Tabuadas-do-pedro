import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { usePlayerState } from "~/lib/storage";

const TOTAL_ROUNDS = 8;
const DENOMINATORS = [2, 3, 4, 5, 6, 8];

const FRACTION_WORDS: Record<number, [singular: string, plural: string]> = {
  2: ["metade", "metades"],
  3: ["terço", "terços"],
  4: ["quarto", "quartos"],
  5: ["quinto", "quintos"],
  6: ["sexto", "sextos"],
  8: ["oitavo", "oitavos"],
};

type Order = { numerator: number; denominator: number };

function nextOrder(prev?: Order): Order {
  for (let i = 0; i < 50; i++) {
    const denominator = DENOMINATORS[Math.floor(Math.random() * DENOMINATORS.length)];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    if (
      !prev ||
      prev.denominator !== denominator ||
      prev.numerator !== numerator
    ) {
      return { numerator, denominator };
    }
  }
  return { numerator: 1, denominator: 2 };
}

export default function EscolaFracoes() {
  const navigate = useNavigate();
  const { update } = usePlayerState();

  const [round, setRound] = useState(1);
  const [order, setOrder] = useState<Order>(() => nextOrder());
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reset, setReset] = useState(0);

  useEffect(() => {
    setSelected(new Set());
    setFeedback(null);
  }, [round, reset]);

  function toggleSlice(i: number) {
    if (feedback !== null) return;
    sfx.click();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function check() {
    if (feedback !== null) return;
    const ok = selected.size === order.numerator;
    if (ok) {
      sfx.correct();
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      sfx.wrong();
      setFeedback("wrong");
    }

    window.setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        const reward = (ok ? score + 1 : score) * 2;
        if (reward > 0) {
          update((s) => ({ ...s, coins: s.coins + reward }));
        }
        setFinished(true);
        sfx.star();
      } else {
        setOrder((prev) => nextOrder(prev));
        setRound((r) => r + 1);
      }
    }, 900);
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={TOTAL_ROUNDS}
        coinsEarned={score * 2}
        onAgain={() => {
          setRound(1);
          setOrder(nextOrder());
          setScore(0);
          setFinished(false);
          setReset((r) => r + 1);
        }}
        onExit={() => navigate("/escola")}
      />
    );
  }

  return (
    <Screen>
      <TopBar
        title="PIZZARIA"
        onBack={() => {
          sfx.click();
          navigate("/escola");
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <Hud icon="🍕" label={`${round}/${TOTAL_ROUNDS}`} />
        <Hud icon="✅" label={`${score}`} />
      </div>

      <div
        className="
          flex items-center gap-3 border-[3px] border-pixel-gold bg-pixel-dark
          p-4 shadow-pixel
        "
      >
        <div className="shrink-0 text-4xl leading-none">🧑‍🍳</div>
        <div
          className="
            flex flex-1 flex-col items-center gap-1 text-center
            font-[family-name:var(--font-pixel)] text-[11px] text-pixel-gold
          "
        >
          <span>O CLIENTE QUER</span>
          <span className="text-pixel-blue text-base">
            {order.numerator}/{order.denominator} DA PIZA
          </span>
          <span className="text-[9px] opacity-80">
            ({order.numerator}{" "}
            {
              FRACTION_WORDS[order.denominator][
                order.numerator === 1 ? 0 : 1
              ]
            }
            )
          </span>
        </div>
      </div>

      <Pizza
        slices={order.denominator}
        selected={selected}
        onToggle={toggleSlice}
        feedback={feedback}
        correctCount={order.numerator}
      />

      <p className="text-center font-[family-name:var(--font-pixel)] text-[9px] text-pixel-blue">
        SELECIONADO: {selected.size}/{order.denominator}
      </p>

      <button
        onClick={check}
        disabled={feedback !== null}
        className={`
          pixel-btn px-5 py-4 text-sm text-white
          ${feedback !== null ? "bg-[#444] opacity-60" : "bg-pixel-green"}
        `}
      >
        SERVIR ▶
      </button>
    </Screen>
  );
}

function Pizza({
  slices,
  selected,
  onToggle,
  feedback,
  correctCount,
}: {
  slices: number;
  selected: Set<number>;
  onToggle: (i: number) => void;
  feedback: "correct" | "wrong" | null;
  correctCount: number;
}) {
  const cx = 110;
  const cy = 110;
  const r = 100;

  const paths = useMemo(() => {
    return Array.from({ length: slices }, (_, i) => {
      const start = (i / slices) * 2 * Math.PI - Math.PI / 2;
      const end = ((i + 1) / slices) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = end - start > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const labelAngle = (start + end) / 2;
      const lx = cx + r * 0.55 * Math.cos(labelAngle);
      const ly = cy + r * 0.55 * Math.sin(labelAngle);
      return { d, lx, ly };
    });
  }, [slices]);

  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 220 220"
        className="h-[clamp(220px,55vw,300px)] w-[clamp(220px,55vw,300px)]"
      >
        {/* Crust */}
        <circle cx={cx} cy={cy} r={r + 6} fill="#a16207" stroke="#1a1a2e" strokeWidth={4} />
        {paths.map((p, i) => {
          const isSelected = selected.has(i);
          let fill = isSelected ? "#ef4444" : "#fef3c7";
          if (feedback === "correct" && isSelected) fill = "#4ade80";
          if (feedback === "wrong" && isSelected) fill = "#ef4444";
          return (
            <g key={i}>
              <path
                d={p.d}
                fill={fill}
                stroke="#1a1a2e"
                strokeWidth={3}
                onClick={() => onToggle(i)}
                style={{ cursor: feedback === null ? "pointer" : "default" }}
              />
              {isSelected && (
                <text
                  x={p.lx}
                  y={p.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={20}
                >
                  🍕
                </text>
              )}
            </g>
          );
        })}
        {feedback === "wrong" && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={48}
            fill="#1a1a2e"
            fontWeight="bold"
          >
            {correctCount}
          </text>
        )}
      </svg>
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
      ? "MESTRE DA PIZA!"
      : ratio >= 0.7
      ? "MUITO BEM!"
      : ratio >= 0.4
      ? "BOM TRABALHO!"
      : "TENTA OUTRA VEZ!";
  const emoji =
    ratio >= 0.95 ? "👨‍🍳" : ratio >= 0.7 ? "🎉" : ratio >= 0.4 ? "👍" : "💪";

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
