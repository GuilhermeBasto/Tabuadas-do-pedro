import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Modal } from "~/components/Modal";
import { Screen, TopBar } from "~/components/Screen";
import { FeedbackOverlay } from "~/components/FeedbackOverlay";
import { useEffects } from "~/components/Effects";
import { sfx } from "~/lib/audio";
import {
  BOSSES,
  SHOP_ITEMS,
  WORLDS,
  type Boss,
  type GameMode,
  type ShopItemId,
} from "~/lib/constants";
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
  bossWin?: boolean;
  bossReward?: number;
  bossFirstDefeat?: boolean;
  endlessReached?: number;
  endlessNewRecord?: boolean;
  endlessPrevRecord?: number;
};

export default function Play() {
  const { mode, tabuada } = useParams<{ mode: string; tabuada?: string }>();
  const navigate = useNavigate();

  const tabuadaNum = parseInt(tabuada ?? "0", 10) || 0;
  const validMode: GameMode =
    mode === "adventure" ||
    mode === "training" ||
    mode === "boss" ||
    mode === "endless"
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
  const { state, update } = usePlayerState();
  const effects = useEffects();

  const boss: Boss | null =
    mode === "boss" ? BOSSES.find((b) => b.tabuada === tabuada) ?? null : null;

  // Game session is mutated via session.current (avoids re-render churn during
  // animations); a separate `tick` state triggers UI updates at controlled moments.
  // Lazy init runs initSession() only once on first render.
  const [session] = useState<{ current: GameSession }>(() => ({
    current: initSession(mode, tabuada, boss),
  }));
  const [, tick] = useState(0);
  const forceRender = useCallback(() => tick((n) => n + 1), []);

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pickedValue, setPickedValue] = useState<number | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
  const [quitOpen, setQuitOpen] = useState(false);
  const [bossTimeLeft, setBossTimeLeft] = useState(boss?.timeLimit ?? 60);
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
    if (g.mode === "boss") {
      if (g.bossHp <= 0) return finish();
      if (g.lives <= 0) return finish();
    } else if (g.mode === "endless") {
      if (g.lives <= 0) return finish();
    } else {
      if (g.current >= g.total) return finish();
      if (g.lives <= 0) return finish();
    }

    g.current++;
    g.answered = false;
    g.q = makeQuestion(g);
    setPickedValue(null);
    setHiddenOptions(new Set());
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
      if (g.mode === "boss") {
        g.bossHp = Math.max(0, g.bossHp - 1);
        sfx.bossHit();
      } else {
        sfx.correct();
      }
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
      setFeedback({
        text: g.mode === "boss" ? "DANO!" : "CERTO!",
        type: "correct",
        key: Date.now(),
      });
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

  // ---- Power-up usage ----
  function usePowerUp(id: ShopItemId) {
    const owned = state.inventory[id] ?? 0;
    if (owned <= 0) return;
    const g = session.current;
    if (g.finished) return;

    if (id === "life") {
      g.lives++;
      sfx.powerup();
    } else if (id === "hint") {
      if (!g.q || g.answered) return;
      // Hide 2 wrong options
      const wrong = g.q.options.filter((o) => o !== g.q!.correct);
      const toHide = new Set<number>();
      while (toHide.size < 2 && wrong.length) {
        const i = Math.floor(Math.random() * wrong.length);
        toHide.add(wrong[i]);
        wrong.splice(i, 1);
      }
      setHiddenOptions(toHide);
      sfx.powerup();
    } else if (id === "skip") {
      if (!g.q || g.answered) return;
      g.answered = true;
      sfx.powerup();
      setFeedback({
        text: "SALTOU!",
        type: "correct",
        key: Date.now(),
      });
      window.setTimeout(() => {
        setFeedback(null);
        advance();
      }, 700);
    } else if (id === "freeze") {
      if (g.mode !== "boss" || !g.bossEndTime) return;
      g.bossEndTime += 10_000;
      sfx.powerup();
    }

    update((s) => ({
      ...s,
      inventory: { ...s.inventory, [id]: (s.inventory[id] ?? 0) - 1 },
    }));
    forceRender();
  }

  function finish() {
    const g = session.current;
    if (g.finished) return;
    g.finished = true;
    const r = computeEndResult(g);

    let bossReward = 0;
    let bossFirstDefeat = false;
    if (g.mode === "boss" && r.bossWin && boss) {
      const alreadyDefeated = !!state.bossesDefeated[boss.tabuada];
      bossFirstDefeat = !alreadyDefeated;
      if (bossFirstDefeat) bossReward = boss.reward;
    }

    let endlessReached: number | undefined;
    let endlessNewRecord = false;
    let endlessPrevRecord: number | undefined;
    if (g.mode === "endless") {
      endlessReached = g.correct;
      endlessPrevRecord = state.endlessHighScore;
      endlessNewRecord = g.correct > state.endlessHighScore;
    }

    update((s) => applyEndUpdates(s, g, r, boss, bossReward));

    if (g.mode === "adventure") sfx.star();
    if (g.mode === "boss" && r.bossWin) sfx.bossDefeat();
    if (g.mode === "endless" && endlessNewRecord && g.correct > 0) sfx.star();
    if (
      r.stars >= 2 ||
      (g.mode === "boss" && r.bossWin) ||
      (g.mode === "endless" && endlessNewRecord && g.correct >= 5)
    ) {
      effects.spawnConfetti();
    }

    setResult({
      stars: r.stars,
      title: r.title,
      emoji: r.emoji,
      score: g.score,
      correct: g.correct,
      total: g.correct + g.wrong,
      bossWin: r.bossWin,
      bossReward,
      bossFirstDefeat,
      endlessReached,
      endlessNewRecord,
      endlessPrevRecord,
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
  const world = mode === "adventure" ? WORLDS.find((w) => w.num === tabuada) : null;
  const title =
    mode === "boss"
      ? boss
        ? `${boss.emoji} ${boss.name}`
        : "BOSS FIGHT"
      : mode === "adventure"
        ? `TABUADA DO ${tabuada}`
        : mode === "endless"
          ? "♾️ MARATONA"
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
          {mode === "boss"
            ? `⏱ ${Math.ceil(bossTimeLeft)}s`
            : mode === "endless"
              ? `Q${g.current}`
              : `${g.current}/${g.total}`}
        </div>
      </div>

      {/* Progress / Boss HP / Timer / Endless record */}
      {mode === "boss" && boss ? (
        <BossPanel
          boss={boss}
          hp={g.bossHp}
          maxHp={g.bossMaxHp}
          timeLeft={bossTimeLeft}
        />
      ) : mode === "endless" ? (
        <EndlessBanner
          current={g.correct}
          record={state.endlessHighScore}
        />
      ) : mode === "adventure" && world ? (
        <div className="flex items-center gap-2 font-[family-name:var(--font-pixel)] text-[10px] text-pixel-blue">
          <span className="text-xl">{world.emoji}</span>
          <span>{world.name.toUpperCase()}</span>
          <div className="ml-auto h-3 flex-1 overflow-hidden border-[3px] border-pixel-gold bg-pixel-dark">
            <div
              className="h-full bg-gradient-to-r from-pixel-green to-pixel-gold transition-[width] duration-300"
              style={{ width: `${(g.current / g.total) * 100}%` }}
            />
          </div>
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
            hidden={hiddenOptions.has(opt)}
            onClick={(e) => answer(opt, e.currentTarget)}
          />
        ))}
      </div>

      {/* Power-up bar */}
      <PowerUpBar
        inventory={state.inventory}
        mode={mode}
        answered={g.answered}
        onUse={usePowerUp}
      />
    </Screen>
  );
}

/* ============================================================
   BossPanel — boss portrait + HP bar + timer.
   ============================================================ */
function BossPanel({
  boss,
  hp,
  maxHp,
  timeLeft,
}: {
  boss: Boss;
  hp: number;
  maxHp: number;
  timeLeft: number;
}) {
  const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const lowHp = hpPct <= 33;
  return (
    <div
      className="border-[5px] border-pixel-dark p-3 shadow-pixel"
      style={{
        background: `linear-gradient(135deg, ${boss.bgFrom} 0%, ${boss.bgTo} 100%)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="text-5xl leading-none"
          style={{
            filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.6))",
            animation: lowHp ? "wrong-shake 0.6s infinite" : undefined,
          }}
        >
          {boss.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-[family-name:var(--font-pixel)] text-[10px] text-pixel-gold text-shadow-pixel">
            {boss.name}
          </div>
          <div className="mt-1.5 h-4 w-full overflow-hidden border-[3px] border-pixel-dark bg-black">
            <div
              className={`h-full transition-[width] duration-300 ${
                lowHp ? "bg-pixel-orange" : "bg-pixel-red"
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <div className="mt-1 font-[family-name:var(--font-pixel)] text-[8px] text-white">
            HP: {hp}/{maxHp}
          </div>
        </div>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden border-[2px] border-pixel-dark bg-black">
        <div
          className="h-full bg-gradient-to-r from-pixel-blue to-pixel-purple transition-[width] duration-100"
          style={{ width: `${(timeLeft / boss.timeLimit) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   EndlessBanner — current run + personal record.
   ============================================================ */
function EndlessBanner({
  current,
  record,
}: {
  current: number;
  record: number;
}) {
  const beating = record > 0 && current >= record;
  return (
    <div
      className="
        flex items-center justify-between gap-3 border-[4px] border-pixel-blue
        bg-pixel-dark p-3 shadow-pixel
      "
    >
      <div className="font-[family-name:var(--font-pixel)] text-[10px] text-pixel-blue">
        ♾️ MARATONA
      </div>
      <div className="flex items-center gap-3 font-[family-name:var(--font-pixel)] text-[10px]">
        <span className="text-pixel-green">
          ACERTOS: <span className="text-white">{current}</span>
        </span>
        <span className={beating ? "text-pixel-gold" : "text-pixel-orange"}>
          {beating ? "🥇" : "🏅"} {record}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   PowerUpBar — quick-use shortcuts for owned items.
   ============================================================ */
function PowerUpBar({
  inventory,
  mode,
  answered,
  onUse,
}: {
  inventory: PlayerState["inventory"];
  mode: GameMode;
  answered: boolean;
  onUse: (id: ShopItemId) => void;
}) {
  const totalOwned = SHOP_ITEMS.reduce(
    (sum, i) => sum + (inventory[i.id] ?? 0),
    0,
  );
  if (totalOwned === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2">
      {SHOP_ITEMS.map((item) => {
        const owned = inventory[item.id] ?? 0;
        // Disable conditions per power-up:
        let disabled = owned <= 0;
        if (item.id === "hint" && answered) disabled = true;
        if (item.id === "skip" && answered) disabled = true;
        if (item.id === "freeze" && mode !== "boss") disabled = true;
        return (
          <button
            key={item.id}
            onClick={() => !disabled && onUse(item.id)}
            disabled={disabled}
            aria-label={`Usar ${item.name}`}
            className={`
              pixel-btn relative flex flex-col items-center gap-0.5 px-2 py-2
              text-[8px] text-white
              ${disabled ? "bg-[#333] opacity-50" : "bg-pixel-purple"}
            `}
          >
            <span className="text-2xl leading-none">{item.emoji}</span>
            <span className="leading-tight">x{owned}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */
function initSession(
  mode: GameMode,
  tabuada: number,
  boss: Boss | null,
): GameSession {
  if (mode === "adventure") {
    return newGame({ mode: "adventure", tabuada, total: 10, lives: 3 });
  }
  if (mode === "boss") {
    if (boss) {
      return newGame({
        mode: "boss",
        tabuada: boss.tabuada,
        total: 999,
        lives: 3,
        timeLimit: boss.timeLimit,
        bossHp: boss.hp,
      });
    }
    return newGame({
      mode: "boss",
      tabuada: 0,
      total: 999,
      lives: 3,
      timeLimit: 60,
      bossHp: 6,
    });
  }
  if (mode === "endless") {
    return newGame({ mode: "endless", tabuada: 0, total: 9999, lives: 1 });
  }
  return newGame({ mode: "training", tabuada, total: 10, lives: 5 });
}

function applyEndUpdates(
  s: PlayerState,
  g: GameSession,
  r: ReturnType<typeof computeEndResult>,
  boss: Boss | null,
  bossReward: number,
): PlayerState {
  const next = { ...s };
  next.coins += g.score + bossReward;

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
    if (r.bossWin && boss) {
      next.bossesDefeated = {
        ...next.bossesDefeated,
        [boss.tabuada]: true,
      };
      next.badges = { ...next.badges, boss50: true };
      const allDefeated = BOSSES.every(
        (b) => next.bossesDefeated[b.tabuada],
      );
      if (allDefeated) next.badges = { ...next.badges, bossAll: true };
    }
  } else if (g.mode === "endless") {
    if (g.correct > next.endlessHighScore) next.endlessHighScore = g.correct;
    if (g.correct >= 25) next.badges = { ...next.badges, endless25: true };
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
  hidden,
  onClick,
}: {
  value: number;
  answered: boolean;
  picked: boolean;
  isCorrectAnswer: boolean;
  hidden: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  let stateClasses = "bg-pixel-blue";
  if (hidden) {
    stateClasses = "bg-[#333] opacity-30";
  } else if (answered) {
    if (picked && isCorrectAnswer) stateClasses = "bg-pixel-green animate-correct-shake";
    else if (picked && !isCorrectAnswer) stateClasses = "bg-pixel-red animate-wrong-shake";
    else if (isCorrectAnswer) stateClasses = "bg-pixel-green opacity-90";
    else stateClasses = "bg-pixel-blue opacity-60";
  }

  return (
    <button
      disabled={answered || hidden}
      onClick={onClick}
      className={`pixel-btn px-3 py-6 text-2xl text-white disabled:cursor-default ${stateClasses}`}
    >
      {hidden ? "✖" : value}
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
  bossWin,
  bossReward,
  bossFirstDefeat,
  endlessReached,
  endlessNewRecord,
  endlessPrevRecord,
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

      {mode === "boss" && bossWin && bossFirstDefeat && bossReward ? (
        <p className="my-2.5 font-[family-name:var(--font-pixel)] text-[12px] text-pixel-gold">
          🎁 BÓNUS 1ª VEZ: +{bossReward} 🪙
        </p>
      ) : null}

      {mode === "endless" && endlessReached !== undefined ? (
        <div className="my-3">
          <p className="font-[family-name:var(--font-pixel)] text-[14px] text-pixel-blue">
            CHEGASTE A{" "}
            <span className="text-pixel-gold">{endlessReached}</span>!
          </p>
          {endlessNewRecord && endlessReached > 0 ? (
            <p className="mt-2 animate-bounce-slow font-[family-name:var(--font-pixel)] text-[13px] text-pixel-gold">
              🥇 NOVO RECORD!
            </p>
          ) : (
            <p className="mt-2 font-[family-name:var(--font-pixel)] text-[10px] text-pixel-orange">
              🏅 RECORD: {endlessPrevRecord ?? 0}
            </p>
          )}
        </div>
      ) : null}

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
