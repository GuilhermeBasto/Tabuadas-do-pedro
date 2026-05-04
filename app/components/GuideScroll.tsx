import { useState } from "react";
import { sfx } from "~/lib/audio";
import { BADGES, WORLDS } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

type TabId = "modos" | "mundos" | "estrelas" | "trofeus";

const TABS: { id: TabId; emoji: string; label: string }[] = [
  { id: "modos", emoji: "🎮", label: "MODOS" },
  { id: "mundos", emoji: "🌍", label: "MUNDOS" },
  { id: "estrelas", emoji: "⭐", label: "ESTRELAS" },
  { id: "trofeus", emoji: "🏆", label: "TROFÉUS" },
];

export function GuideScroll({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabId>("modos");
  const { state } = usePlayerState();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-3"
      style={{ animation: "fade-in 0.2s ease-out" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          flex max-h-[90dvh] w-full max-w-[22rem] flex-col border-[4px] border-[#5a3a1a]
          shadow-pixel-lg animate-scroll-unroll
        "
        style={{
          background:
            "linear-gradient(135deg, #f5deb3 0%, #e8c98a 50%, #d4a574 100%)",
          transformOrigin: "top center",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b-[3px] border-[#5a3a1a] bg-[#3d2410] px-2.5 py-2">
          <h2
            id="guide-title"
            className="font-[family-name:var(--font-pixel)] text-[clamp(9px,3vw,11px)] leading-tight text-pixel-gold"
            style={{ textShadow: "2px 2px 0 #1a0e05" }}
          >
            📜 PERGAMINHO
          </h2>
          <button
            onClick={() => {
              sfx.click();
              onClose();
            }}
            className="
              pixel-btn h-8 w-8 shrink-0 bg-pixel-red text-xs text-white
              border-[3px] shadow-pixel-sm
            "
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 border-b-[3px] border-[#5a3a1a] bg-[#c69968] p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sfx.click();
                setTab(t.id);
              }}
              className={`
                pixel-btn flex flex-col items-center justify-center gap-0.5
                border-[3px] px-1 py-1.5 leading-none shadow-pixel-sm
                font-[family-name:var(--font-pixel)] text-[6px]
                ${tab === t.id ? "bg-pixel-gold text-pixel-dark" : "bg-[#8b5a2b] text-white"}
              `}
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 text-[#3d2410]">
          {tab === "modos" && <ModosSection />}
          {tab === "mundos" && <MundosSection />}
          {tab === "estrelas" && <EstrelasSection />}
          {tab === "trofeus" && <TrofeusSection badges={state.badges} />}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Sections
   ============================================================ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="
        mb-2.5 border-b-2 border-[#8b5a2b] pb-1.5 font-[family-name:var(--font-pixel)]
        text-[clamp(9px,2.6vw,11px)] text-[#5a3a1a]
      "
    >
      {children}
    </h3>
  );
}

function Row({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex gap-2">
      <div className="text-xl leading-none">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-[family-name:var(--font-pixel)] text-[9px] text-[#5a3a1a]">
          {title}
        </div>
        <div className="mt-1 text-[11px] leading-snug text-[#3d2410]">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModosSection() {
  return (
    <div>
      <SectionTitle>COMO SE JOGA?</SectionTitle>
      <Row icon="🗺️" title="AVENTURA">
        10 perguntas, <b>3 vidas</b>. Acerta muito para ganhar até 3 estrelas!
      </Row>
      <Row icon="🎯" title="TREINO">
        10 perguntas, <b>5 vidas</b>. Pratica numa tabuada à tua escolha.
      </Row>
      <Row icon="👹" title="BOSS FIGHT">
        <b>60 segundos</b> de pura ação! Acerta o máximo que conseguires.
      </Row>
      <div
        className="
          mt-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-2
          text-[10px] leading-snug text-[#5a3a1a]
        "
      >
        💡 <b>DICA:</b> cada acerto dá <b>+1 moeda</b>. No fim, ganhas tudo o
        que marcaste como pontuação extra!
      </div>
    </div>
  );
}

function MundosSection() {
  return (
    <div>
      <SectionTitle>OS 10 MUNDOS</SectionTitle>
      <p className="mb-2.5 text-[11px] leading-snug">
        Cada tabuada é um mundo mágico. Conquista todos!
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {WORLDS.map((w) => (
          <div
            key={w.num}
            className="
              flex items-center gap-1.5 border-2 border-[#8b5a2b] bg-[#fff4d6]
              px-1.5 py-1
            "
          >
            <span className="text-lg leading-none shrink-0">{w.emoji}</span>
            <div className="font-[family-name:var(--font-pixel)] text-[7px] text-[#5a3a1a] min-w-0">
              <div>×{w.num}</div>
              <div className="mt-0.5 opacity-80 truncate">
                {w.name.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstrelasSection() {
  const tiers = [
    { stars: 3, emoji: "🌟", title: "PERFEITO!", req: "≥ 95% certos" },
    { stars: 2, emoji: "🎉", title: "MUITO BEM!", req: "≥ 75% certos" },
    { stars: 1, emoji: "👍", title: "BOM TRABALHO!", req: "≥ 50% certos" },
    { stars: 0, emoji: "💪", title: "QUASE!", req: "< 50% certos" },
  ];
  return (
    <div>
      <SectionTitle>SISTEMA DE ESTRELAS</SectionTitle>
      <p className="mb-2.5 text-[11px] leading-snug">
        Só na <b>Aventura</b>. Quanto mais acertas, mais estrelas ganhas!
      </p>
      <div className="space-y-1.5">
        {tiers.map((t) => (
          <div
            key={t.stars}
            className="
              flex items-center gap-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-1.5
            "
          >
            <div className="w-14 shrink-0 text-center text-sm tracking-tight">
              {"⭐".repeat(t.stars) + "☆".repeat(3 - t.stars)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#5a3a1a]">
                {t.emoji} {t.title}
              </div>
              <div className="text-[10px] opacity-80">{t.req}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BADGE_HINTS: Record<string, string> = {
  firstWin: "Acerta 1 pergunta numa ronda",
  star10: "Junta 10 estrelas no total",
  star20: "Junta 20 estrelas no total",
  allWorlds: "Passa em todas as 10 tabuadas",
  perfect: "Aventura com 100% de acertos",
  streak5: "5 acertos seguidos",
  streak10: "10 acertos seguidos",
  boss50: "50+ pontos no Boss Fight",
  rich: "Junta 500 moedas",
  master2: "3 estrelas na tabuada do 2",
  master5: "3 estrelas na tabuada do 5",
  master10: "3 estrelas na tabuada do 10",
};

function TrofeusSection({ badges }: { badges: Record<string, boolean> }) {
  const unlockedCount = BADGES.filter((b) => badges[b.id]).length;
  return (
    <div>
      <SectionTitle>
        TROFÉUS ({unlockedCount}/{BADGES.length})
      </SectionTitle>
      <p className="mb-2.5 text-[11px] leading-snug">
        Coleciona todos para te tornares um <b>Mestre da Tabuada</b>!
      </p>
      <div className="grid grid-cols-1 gap-1">
        {BADGES.map((b) => {
          const got = !!badges[b.id];
          return (
            <div
              key={b.id}
              className={`
                flex items-center gap-2 border-2 px-1.5 py-1
                ${got ? "border-pixel-gold bg-[#fff4d6]" : "border-[#8b5a2b] bg-[#d4b88a] opacity-70"}
              `}
            >
              <div
                className={`text-xl leading-none shrink-0 ${got ? "" : "grayscale opacity-50"}`}
              >
                {b.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#5a3a1a]">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[10px] leading-snug opacity-85">
                  {BADGE_HINTS[b.id] ?? "???"}
                </div>
              </div>
              {got && <div className="text-sm shrink-0">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
