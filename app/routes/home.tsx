import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GuideScroll } from "~/components/GuideScroll";
import { Screen } from "~/components/Screen";
import { sfx, initAudioUnlock } from "~/lib/audio";
import {
  getInstallPrompt,
  subscribeInstallPrompt,
  triggerInstall,
} from "~/lib/installPrompt";
import { usePlayerState } from "~/lib/storage";

export default function Home() {
  const navigate = useNavigate();
  const { state } = usePlayerState();
  const [canInstall, setCanInstall] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    initAudioUnlock();
    setCanInstall(getInstallPrompt() !== null);
    return subscribeInstallPrompt((e) => setCanInstall(e !== null));
  }, []);

  function go(path: string) {
    sfx.click();
    navigate(path);
  }

  async function installApp() {
    await triggerInstall();
  }

  return (
    <Screen>
      {/* Pergaminho do Sábio — floating help button */}
      <button
        onClick={() => {
          sfx.click();
          setGuideOpen(true);
        }}
        aria-label="Pergaminho do Sábio"
        className="
          pixel-btn absolute right-3 top-3 z-10 flex h-11 w-11 items-center
          justify-center bg-[#d4a574] text-lg
        "
        style={{ borderColor: "#5a3a1a" }}
      >
        <span className="inline-block animate-wiggle">📜</span>
      </button>

      <GuideScroll open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Logo */}
      <div className="mt-2.5 text-center">
        <div
          className="
            mb-3.5 animate-bounce-slow font-[family-name:var(--font-pixel)]
            text-[clamp(22px,7vw,36px)] leading-snug text-pixel-gold
          "
          style={{
            textShadow:
              "3px 3px 0 var(--color-pixel-red), 6px 6px 0 var(--color-pixel-dark), 0 0 20px rgba(255,215,0,0.5)",
          }}
        >
          TABUADAS
        </div>
        <div
          className="
            font-[family-name:var(--font-pixel)] text-[clamp(11px,3.2vw,16px)]
            tracking-wider text-pixel-blue text-shadow-pixel
          "
        >
          ★ DO PEDRO ★
        </div>
      </div>

      {/* Hero — Pedro pixel-art */}
      <div className="flex justify-center">
        <div
          className="
            animate-float overflow-hidden border-[6px] border-pixel-dark
            shadow-pixel-lg
          "
          style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.4))" }}
        >
          <img
            src="/pedro.png"
            alt="Pedro herói"
            className="block h-[clamp(140px,32vw,200px)] w-[clamp(140px,32vw,200px)] object-cover"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex flex-wrap justify-center gap-2.5">
        <StatPill icon="🪙" value={state.coins} colorClass="border-pixel-gold text-pixel-gold" />
        <StatPill icon="⭐" value={state.totalStars} colorClass="border-pixel-purple text-pixel-purple" />
        <StatPill icon="🔥" value={state.streak} colorClass="border-pixel-orange text-pixel-orange" />
      </div>

      {/* Menu */}
      <div className="mt-2 grid grid-cols-2 gap-3.5">
        <MenuButton emoji="🗺️" label="AVENTURA" onClick={() => go("/adventure")} bg="bg-pixel-red" />
        <MenuButton emoji="🎯" label="TREINO" onClick={() => go("/training")} bg="bg-pixel-green" />
        <MenuButton
          emoji="👹"
          label="BOSSES"
          onClick={() => go("/bosses")}
          bg="bg-pixel-purple"
        />
        <MenuButton
          emoji="♾️"
          label="MARATONA"
          onClick={() => go("/play/endless")}
          bg="bg-pixel-blue"
        />
        <MenuButton
          emoji="🛒"
          label="LOJA"
          onClick={() => go("/shop")}
          bg="bg-pixel-pink"
        />
        <MenuButton
          emoji="🏆"
          label="TROFÉUS"
          onClick={() => go("/collection")}
          bg="bg-pixel-orange"
        />
      </div>

      <button
        onClick={() => go("/escola")}
        className="
          pixel-btn mt-1 flex items-center justify-center gap-3 bg-pixel-blue
          px-4 py-4 font-[family-name:var(--font-pixel)] text-[11px] text-white
        "
      >
        <span className="text-2xl">📚</span>
        <span>ESCOLA — JOGOS NOVOS</span>
        <span className="text-2xl">✨</span>
      </button>

      {canInstall && (
        <button
          onClick={installApp}
          className="
            pixel-btn mt-4 self-center bg-pixel-gold px-5 py-3.5
            font-[family-name:var(--font-pixel)] text-[11px] text-pixel-dark
          "
        >
          📲 INSTALAR APP
        </button>
      )}
    </Screen>
  );
}

function StatPill({
  icon,
  value,
  colorClass,
}: {
  icon: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 border-[3px] bg-pixel-dark px-3.5 py-2.5
        font-[family-name:var(--font-pixel)] text-xs shadow-pixel
        ${colorClass}
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function MenuButton({
  emoji,
  label,
  onClick,
  bg,
}: {
  emoji: string;
  label: React.ReactNode;
  onClick: () => void;
  bg: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        pixel-btn min-h-[120px] flex-col gap-3 px-3 py-5 text-white
        flex items-center justify-center
        ${bg}
        font-[family-name:var(--font-pixel)] text-[11px] leading-relaxed
      `}
    >
      <span className="text-[36px] leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

