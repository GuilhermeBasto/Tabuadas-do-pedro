import { useState } from "react";
import { useNavigate } from "react-router";
import { Modal } from "~/components/Modal";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { SHOP_ITEMS, type ShopItem } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

export default function Shop() {
  const navigate = useNavigate();
  const { state, update } = usePlayerState();
  const [purchasedKey, setPurchasedKey] = useState(0);
  const [purchasedLabel, setPurchasedLabel] = useState<string | null>(null);
  const [noFundsOpen, setNoFundsOpen] = useState(false);

  function buy(item: ShopItem) {
    if (state.coins < item.price) {
      sfx.wrong();
      setNoFundsOpen(true);
      return;
    }
    sfx.purchase();
    update((s) => ({
      ...s,
      coins: s.coins - item.price,
      inventory: {
        ...s.inventory,
        [item.id]: (s.inventory[item.id] ?? 0) + 1,
      },
      badges: { ...s.badges, shopper: true },
    }));
    setPurchasedKey((k) => k + 1);
    setPurchasedLabel(`+1 ${item.emoji}`);
    window.setTimeout(() => setPurchasedLabel(null), 900);
  }

  return (
    <Screen>
      <TopBar
        title="LOJA"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

      <Modal
        open={noFundsOpen}
        icon="💸"
        title="MOEDAS A MENOS!"
        message={<>Joga mais para<br />ganhar moedas.</>}
        cancelLabel="OK"
        confirmLabel="JOGAR"
        onCancel={() => {
          sfx.click();
          setNoFundsOpen(false);
        }}
        onConfirm={() => {
          sfx.click();
          setNoFundsOpen(false);
          navigate("/adventure");
        }}
      />

      {/* Coin balance */}
      <div className="flex items-center justify-center">
        <div
          className="
            inline-flex items-center gap-2.5 border-[3px] border-pixel-gold
            bg-pixel-dark px-5 py-3 font-[family-name:var(--font-pixel)] text-sm
            text-pixel-gold shadow-pixel
          "
        >
          <span className="text-2xl">🪙</span>
          <span>{state.coins}</span>
        </div>
      </div>

      {/* Floating "purchased" toast */}
      {purchasedLabel && (
        <div
          key={purchasedKey}
          className="pointer-events-none fixed left-1/2 top-1/3 z-[200] -translate-x-1/2 animate-feedback-pop font-[family-name:var(--font-pixel)] text-[clamp(28px,8vw,48px)] text-pixel-green"
          style={{
            textShadow: "3px 3px 0 var(--color-pixel-dark)",
          }}
        >
          {purchasedLabel}
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-3">
        {SHOP_ITEMS.map((item) => {
          const owned = state.inventory[item.id] ?? 0;
          const canAfford = state.coins >= item.price;
          return (
            <div
              key={item.id}
              className="
                flex items-center gap-3 border-4 border-pixel-purple bg-pixel-dark
                p-3 shadow-pixel
              "
            >
              <div
                className="
                  flex h-14 w-14 shrink-0 items-center justify-center border-4
                  border-pixel-dark bg-pixel-deep text-3xl shadow-pixel-sm
                "
              >
                {item.emoji}
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <div className="font-[family-name:var(--font-pixel)] text-[10px] text-pixel-gold text-shadow-pixel">
                  {item.name}
                </div>
                <div className="text-[11px] leading-snug text-white opacity-90">
                  {item.desc}
                </div>
                <div className="font-[family-name:var(--font-pixel)] text-[8px] text-pixel-blue">
                  TENS: {owned}
                </div>
              </div>
              <button
                onClick={() => buy(item)}
                disabled={!canAfford}
                className={`
                  pixel-btn flex shrink-0 flex-col items-center gap-0.5 px-3 py-2
                  text-[9px] text-white
                  ${canAfford ? "bg-pixel-green" : "bg-[#444] opacity-60"}
                `}
              >
                <span>🪙 {item.price}</span>
                <span>COMPRAR</span>
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="
          mt-1 border-[3px] border-pixel-gold bg-pixel-dark p-3 text-center
          font-[family-name:var(--font-pixel)] text-[9px] leading-relaxed text-pixel-gold
          shadow-pixel
        "
      >
        💡 USA OS POWER-UPS<br />NO MEIO DO JOGO!
      </div>
    </Screen>
  );
}
