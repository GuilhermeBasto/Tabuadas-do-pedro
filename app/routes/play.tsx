import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Modal } from "~/components/Modal";
import { Screen, TopBar } from "~/components/Screen";
import { FeedbackOverlay } from "~/components/FeedbackOverlay";
import { useEffects } from "~/components/Effects";
import { sfx } from "~/lib/audio";
import { WORLDS, type GameMode } from "~/lib/constants";
import {
  computeEndResult,
  makeQuestion,
  newGame,
  type GameSession,
} from "~/lib/game";
import { usePlayerState, type PlayerState } from "~/lib/storage";

type Feedback = { text: string; type: "correct" | "wrong"; key: number } | null;
type ResultView = {
  stars: number;
  title: string;
  emoji: string;
  score: number;
  correct: number;
  total: number;
};

export default function Play() {
  const { mode, tabuada } = useParams<{ mode: string; tabuada?: string }>();
  const navigate = useNavigate();

  const tabuadaNum = parseInt(tabuada ?? "0", 10) || 0;
  const validMode: GameMode =
    mode === "adventure" || mode === "training" || mode === "boss"
      ? mode
      : "training";

  // The component re-mounts when params change (via the `key` prop strategy
  // on the parent — but React Router does it automatically when params change
  // because `useParams` triggers re-renders, NOT remounts. So we need a
  // restart counter that resets local state on replay.
  const [restartKey, setRestartKey] = useState(0);

  return (
    <PlaySession
      key={`${validMode}-${tabuadaNum}-${restartKey}`}
      mode={validMode}
      tabuada={tabuadaNum}
      onRestart={() => setRestartKey((k) => k + 1)}
      onHome={() => {
        sfx.click();
        navigate("/");
      }}
    />
  );
}

/* ============================================================
   PlaySession — one full playthrough.
   Re-mounting this component (via parent key) gives us a clean
   reset for replays — no manual state cleanup needed.
   ============================================================ */
function PlaySession({
  mode,
  tabuada,
  onRestart,
  onHome,
}: {
  mode: GameMode;
  tabuada: number;
  onRestart: () => void;
  onHome: () => void;
}) {
  const { update } = usePlayerState();
  const effects = useEffects();

  // Game session is mutated via session.current (avoids re-render churn during
  // animations); a separate `tick` state triggers UI updates at controlled moments.
  // Lazy init runs initSession() only once on first render.
  const [session] = useState<{ current: GameSession }>(() => ({
    current: initSession(mode, tabuada),
  }));
  const [, tick] = useState(0);
  const forceRender = useCallback(() => tick((n) => n + 1), []);

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pickedValue, setPickedValue] = useState<number | null>(null);
  const [quitOpen, setQuitOpen] = useState(false);
  const [bossTimeLeft, setBossTimeLeft] = useState(60);
  const [result, setResult] = useState<ResultView | null>(null);

  // Initial question
  useEffect(() => {
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boss timer (rAF for smoothness, only while running)
  useEffect(() => {
    if (mode !== "boss") return;
    let raf = 0;
    const tickFn = () => {
      const g = session.current;
      if (g.finished) return;
      const left = Math.max(0, (g.bossEndTime ?? 0) - Date.now());
      setBossTimeLeft(left / 1000);
      if (left <= 0) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tickFn);
    };
    raf = requestAnimationFrame(tickFn);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function advance() {
    const g = session.current;
    if (g.finished) return;
    if (g.mode !== "boss" && g.current >= g.total) return finish();
    if (g.lives <= 0) return finish();

    g.current++;
    g.answered = false;
    g.q = makeQuestion(g);
    setPickedValue(null);
    forceRender();
  }

  function answer(value: number, btn: HTMLButtonElement) {
    const g = session.current;
    if (!g.q || g.answered) return;
    g.answered = true;
    setPickedValue(value);
    const isCorrect = value === g.q.correct;

    if (isCorrect) {
      g.correct++;
      g.score += g.mode === "boss" ? 10 : 5;
      sfx.correct();
      effects.spawnCoin(btn);
      sfx.coin();
      update((s) => {
        const newStreak = s.streak + 1;
        return {
          ...s,
          coins: s.coins + 1,
          streak: newStreak,
          badges: {
            ...s.badges,
            ...(newStreak >= 5 ? { streak5: true } : {}),
            ...(newStreak >= 10 ? { streak10: true } : {}),
          },
        };
      });
      setFeedback({ text: "CERTO!", type: "correct", key: Date.now() });
      window.setTimeout(() => {
        setFeedback(null);
        advance();
      }, 900);
    } else {
      g.wrong++;
      g.lives--;
      g.history.push({ a: g.q.a, b: g.q.b });
      sfx.wrong();
      update((s) => ({ ...s, streak: 0 }));
      setFeedback({
        text: `= ${g.q.correct}`,
        type: "wrong",
        key: Date.now(),
      });
      window.setTimeout(() => {
        setFeedback(null);
        advance();
      }, 1800);
    }
    forceRender();
  }

  function finish() {
    const g = session.current;
    if (g.finished) return;
    g.finished = true;
    const r = computeEndResult(g);

    update((s) => applyEndUpdates(s, g, r));

    if (g.mode === "adventure") sfx.star();
    if (r.stars >= 2 || g.score >= 50) effects.spawnConfetti();

    setResult({
      stars: r.stars,
      title: r.title,
      emoji: r.emoji,
      score: g.score,
      correct: g.correct,
      total: g.correct + g.wrong,
    });
  }

  // ---- Render: result screen ----
  if (result) {
    return (
      <Screen>
        {effects.nodes}
        <ResultPanel
          {...result}
          mode={mode}
          onReplay={() => {
            sfx.click();
            onRestart();
          }}
          onHome={onHome}
        />
      </Screen>
    );
  }

  // ---- Render: game ----
  const g = session.current;
  const title =
    mode === "boss"
      ? "BOSS FIGHT 👹"
      : mode === "adventure"
        ? `TABUADA DO ${tabuada}`
        : tabuada === 0
          ? "MISTURA TUDO"
          : `TREINO ${tabuada}×`;

  return (
    <Screen>
      {effects.nodes}
      {feedback && (
        <FeedbackOverlay key={feedback.key} text={feedback.text} type={feedback.type} />
      )}

      <Modal
        open={quitOpen}
        title="SAIR DO JOGO?"
        message={
          <>
            Vais perder o<br />progresso desta ronda!
          </>
        }
        cancelLabel="CONTINUAR"
        confirmLabel="SAIR"
        variant="danger"
        onCancel={() => {
          sfx.click();
          setQuitOpen(false);
        }}
        onConfirm={() => {
          setQuitOpen(false);
          onHome();
        }}
      />

      <TopBar
        title={title}
        onBack={() => {
          sfx.click();
          setQuitOpen(true);
        }}
      />

      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-[family-name:var(--font-pixel)] text-[11px]">
        <div className="border-[3px] border-pixel-red bg-pixel-dark px-3 py-2 text-pixel-red shadow-pixel">
          {"❤️".repeat(Math.max(0, g.lives))}
        </div>
        <div className="border-[3px] border-pixel-gold bg-pixel-dark px-3 py-2 text-pixel-gold shadow-pixel">
          🪙 {g.score}
        </div>
        <div className="border-[3px] border-pixel-green bg-pixel-dark px-3 py-2 text-pixel-green shadow-pixel">
          {mode === "boss" ? `Q${g.current}` : `${g.current}/${g.total}`}
        </div>
      </div>

      {/* Progress / Timer */}
      {mode === "boss" ? (
        <div className="h-5 w-full overflow-hidden border-[3px] border-pixel-red bg-pixel-dark">
          <div
            className="h-full bg-gradient-to-r from-pixel-red to-pixel-orange transition-[width] duration-100"
            style={{ width: `${(bossTimeLeft / 60) * 100}%` }}
          />
        </div>
      ) : (
        <div className="h-4 w-full overflow-hidden border-[3px] border-pixel-gold bg-pixel-dark">
          <div
            className="h-full bg-gradient-to-r from-pixel-green to-pixel-gold transition-[width] duration-300"
            style={{ width: `${(g.current / g.total) * 100}%` }}
          />
        </div>
      )}

      {/* Question card */}
      <div
        key={g.current}
        className="
          animate-card-pop border-[6px] border-pixel-dark p-7 px-5 text-center
          shadow-pixel-lg
        "
        style={{
          background: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)",
        }}
      >
        <div className="font-[family-name:var(--font-pixel)] text-[11px] text-pixel-dark opacity-70">
          QUANTO É?
        </div>
        <div
          className="
            my-3 font-[family-name:var(--font-pixel)] leading-tight
            text-[clamp(32px,10vw,52px)] text-pixel-dark
          "
          style={{ textShadow: "3px 3px 0 white" }}
        >
          {g.q ? `${g.q.a} × ${g.q.b}` : ""}
        </div>
      </div>

      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {g.q?.options.map((opt) => (
          <AnswerButton
            key={`${g.current}-${opt}`}
            value={opt}
            answered={g.answered}
            picked={pickedValue === opt}
            isCorrectAnswer={opt === g.q!.correct}
            onClick={(e) => answer(opt, e.currentTarget)}
          />
        ))}
      </div>
    </Screen>
  );
}

/* ============================================================
   Helpers
   ============================================================ */
function initSession(mode: GameMode, tabuada: number): GameSession {
  if (mode === "adventure") {
    return newGame({ mode: "adventure", tabuada, total: 10, lives: 3 });
  }
  if (mode === "boss") {
    return newGame({ mode: "boss", tabuada: 0, total: 999, lives: 3, timeLimit: 60 });
  }
  return newGame({ mode: "training", tabuada, total: 10, lives: 5 });
}

function applyEndUpdates(
  s: PlayerState,
  g: GameSession,
  r: ReturnType<typeof computeEndResult>,
): PlayerState {
  const next = { ...s };
  next.coins += g.score;

  if (g.mode === "adventure") {
    const prev = next.worldStars[g.tabuada] || 0;
    if (r.stars > prev) {
      next.totalStars += r.stars - prev;
      next.worldStars = { ...next.worldStars, [g.tabuada]: r.stars };
    }
    if (r.stars >= 1) {
      next.worldCleared = { ...next.worldCleared, [g.tabuada]: true };
    }
    if (r.accuracy === 1) {
      next.badges = { ...next.badges, perfect: true };
    }
  } else if (g.mode === "boss") {
    if (g.score > next.bossHighScore) next.bossHighScore = g.score;
    if (g.score >= 50) next.badges = { ...next.badges, boss50: true };
  }

  if (next.coins >= 500) next.badges = { ...next.badges, rich: true };
  if (g.correct > 0) next.badges = { ...next.badges, firstWin: true };
  if (next.totalStars >= 10) next.badges = { ...next.badges, star10: true };
  if (next.totalStars >= 20) next.badges = { ...next.badges, star20: true };
  if (Object.keys(next.worldCleared).length >= WORLDS.length) {
    next.badges = { ...next.badges, allWorlds: true };
  }
  if (next.worldStars[2] === 3) next.badges = { ...next.badges, master2: true };
  if (next.worldStars[5] === 3) next.badges = { ...next.badges, master5: true };
  if (next.worldStars[10] === 3) next.badges = { ...next.badges, master10: true };

  return next;
}

/* ============================================================
   AnswerButton — single answer choice with reveal/correct/wrong states.
   ============================================================ */
function AnswerButton({
  value,
  answered,
  picked,
  isCorrectAnswer,
  onClick,
}: {
  value: number;
  answered: boolean;
  picked: boolean;
  isCorrectAnswer: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  let stateClasses = "bg-pixel-blue";
  if (answered) {
    if (picked && isCorrectAnswer) stateClasses = "bg-pixel-green animate-correct-shake";
    else if (picked && !isCorrectAnswer) stateClasses = "bg-pixel-red animate-wrong-shake";
    else if (isCorrectAnswer) stateClasses = "bg-pixel-green opacity-90";
    else stateClasses = "bg-pixel-blue opacity-60";
  }

  return (
    <button
      disabled={answered}
      onClick={onClick}
      className={`pixel-btn px-3 py-6 text-2xl text-white disabled:cursor-default ${stateClasses}`}
    >
      {value}
    </button>
  );
}

/* ============================================================
   ResultPanel — end-of-game summary.
   ============================================================ */
function ResultPanel({
  stars,
  title,
  emoji,
  score,
  correct,
  total,
  mode,
  onReplay,
  onHome,
}: ResultView & {
  mode: GameMode;
  onReplay: () => void;
  onHome: () => void;
}) {
  return (
    <div className="px-2.5 py-5 text-center">
      <div className="my-5 animate-result-pop text-[clamp(90px,22vw,150px)] leading-none">
        {emoji}
      </div>
      <h2
        className="
          my-4 font-[family-name:var(--font-pixel)] text-[clamp(20px,6vw,30px)]
          text-pixel-gold
        "
        style={{ textShadow: "3px 3px 0 var(--color-pixel-dark)" }}
      >
        {title}
      </h2>

      {mode === "adventure" && (
        <div className="my-4 text-[clamp(40px,11vw,64px)] leading-none tracking-[8px]">
          {"⭐".repeat(stars) + "☆".repeat(3 - stars)}
        </div>
      )}

      <p className="my-2.5 font-[family-name:var(--font-pixel)] text-[13px] text-white">
        PONTUAÇÃO: {score}
      </p>
      <p className="my-2.5 font-[family-name:var(--font-pixel)] text-[13px] text-white">
        ACERTOS: {correct}/{total}
      </p>
      <p className="my-2.5 font-[family-name:var(--font-pixel)] text-[13px] text-white">
        🪙 +{score} MOEDAS
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={onReplay}
          className="pixel-btn bg-pixel-green px-5 py-3.5 text-[11px] text-white"
        >
          🔁 OUTRA VEZ
        </button>
        <button
          onClick={onHome}
          className="pixel-btn bg-pixel-blue px-5 py-3.5 text-[11px] text-white"
        >
          🏠 INÍCIO
        </button>
      </div>
    </div>
  );
}
