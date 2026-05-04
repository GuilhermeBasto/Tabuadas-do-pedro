import { useState } from "react";
import { sfx } from "~/lib/audio";
import { BADGES, BOSSES, SHOP_ITEMS, WORLDS } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

type TabId = "modos" | "bosses" | "loja" | "trofeus";

const TABS: { id: TabId; emoji: string; label: string }[] = [
  { id: "modos", emoji: "🎮", label: "MODOS" },
  { id: "bosses", emoji: "👹", label: "BOSSES" },
  { id: "loja", emoji: "🛒", label: "LOJA" },
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
          {tab === "bosses" && <BossesSection />}
          {tab === "loja" && <LojaSection />}
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
        10 perguntas, <b>3 vidas</b>. Cada mundo é uma tabuada. Acerta muito
        para ganhar até <b>3 estrelas</b>!
      </Row>
      <Row icon="🎯" title="TREINO">
        10 perguntas, <b>5 vidas</b>. Pratica numa tabuada à tua escolha.
      </Row>
      <Row icon="👹" title="BOSSES">
        Derrota o <b>chefe</b> de cada mundo! Tem barra de vida — cada acerto
        tira HP. Erra e o boss ataca-te.
      </Row>
      <Row icon="♾️" title="MARATONA">
        Perguntas <b>infinitas</b>, só <b>1 vida</b>! Vê até onde consegues
        chegar e bate o teu próprio record.
      </Row>
      <Row icon="🛒" title="LOJA">
        Gasta as moedas em <b>power-ups</b> que ajudam no jogo: pista 50/50,
        salto, vida extra, congelar tempo.
      </Row>
      <div
        className="
          mt-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-2
          text-[10px] leading-snug text-[#5a3a1a]
        "
      >
        💡 <b>ESTRELAS (Aventura):</b><br />
        ≥ 95% = 🌟🌟🌟 · ≥ 75% = 🌟🌟 · ≥ 50% = 🌟
      </div>
    </div>
  );
}

function BossesSection() {
  return (
    <div>
      <SectionTitle>OS 10 BOSSES</SectionTitle>
      <p className="mb-2 text-[11px] leading-snug">
        Cada mundo tem um <b>chefe</b>. Tens de passar o mundo na Aventura
        primeiro para o desbloquear!
      </p>
      <p className="mb-2.5 text-[10px] leading-snug opacity-90">
        ❤️ Acerta para tirar HP do boss · ❌ Erra e perdes vida · 👑 1ª vitória
        dá bónus de moedas.
      </p>
      <div className="space-y-1">
        {BOSSES.map((b) => {
          const world = WORLDS.find((w) => w.num === b.tabuada);
          return (
            <div
              key={b.tabuada}
              className="
                flex items-center gap-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-1.5
              "
            >
              <span className="text-2xl leading-none shrink-0">{b.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#5a3a1a]">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[10px] opacity-80">
                  {world?.emoji} ×{b.tabuada} · HP {b.hp} · {b.timeLimit}s
                </div>
              </div>
              <div className="font-[family-name:var(--font-pixel)] text-[8px] text-pixel-gold-dark shrink-0">
                +{b.reward}🪙
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LojaSection() {
  return (
    <div>
      <SectionTitle>LOJA DE POWER-UPS</SectionTitle>
      <p className="mb-2.5 text-[11px] leading-snug">
        Compra power-ups com as moedas que ganhas a jogar. Usa-os no meio de
        qualquer ronda!
      </p>
      <div className="space-y-1.5">
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            className="
              flex items-center gap-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-1.5
            "
          >
            <span className="text-2xl leading-none shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-[family-name:var(--font-pixel)] text-[8px] text-[#5a3a1a]">
                {item.name}
              </div>
              <div className="mt-0.5 text-[10px] leading-snug opacity-85">
                {item.desc}
              </div>
            </div>
            <div className="font-[family-name:var(--font-pixel)] text-[8px] text-pixel-gold-dark shrink-0">
              {item.price}🪙
            </div>
          </div>
        ))}
      </div>
      <div
        className="
          mt-2 border-2 border-[#8b5a2b] bg-[#fff4d6] p-2
          text-[10px] leading-snug text-[#5a3a1a]
        "
      >
        💡 <b>+1 moeda por cada acerto</b> + bónus da pontuação no fim.
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
  boss50: "Derrota o teu primeiro boss",
  bossAll: "Derrota os 10 bosses",
  endless25: "Acerta 25+ na Maratona",
  shopper: "Compra qualquer item da loja",
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
