import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { BOSSES, WORLDS } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

export default function Bosses() {
  const navigate = useNavigate();
  const { state } = usePlayerState();

  function pickBoss(tabuada: number) {
    sfx.click();
    navigate(`/play/boss/${tabuada}`);
  }

  return (
    <Screen>
      <TopBar
        title="BOSSES"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

      <p className="my-1 text-center font-[family-name:var(--font-pixel)] text-[10px] leading-relaxed text-pixel-blue">
        DERROTA OS CHEFES DE CADA MUNDO
      </p>

      <div className="grid grid-cols-2 gap-3 py-1.5">
        {BOSSES.map((boss) => {
          const world = WORLDS.find((w) => w.num === boss.tabuada);
          const isUnlocked = !!state.worldCleared[boss.tabuada];
          const isDefeated = !!state.bossesDefeated[boss.tabuada];

          const baseClasses =
            "relative flex flex-col items-center gap-1.5 border-4 p-3 text-center shadow-pixel transition-transform";
          let stateClasses = "border-pixel-red bg-pixel-dark cursor-pointer active:translate-x-0.5 active:translate-y-0.5";
          if (!isUnlocked) {
            stateClasses = "border-[#555] bg-pixel-dark opacity-40 cursor-not-allowed";
          } else if (isDefeated) {
            stateClasses =
              "border-pixel-gold bg-gradient-to-br from-[#4a2a00] to-pixel-dark cursor-pointer active:translate-x-0.5 active:translate-y-0.5";
          }

          return (
            <div
              key={boss.tabuada}
              role="button"
              tabIndex={isUnlocked ? 0 : -1}
              aria-disabled={!isUnlocked}
              aria-label={`${boss.name}, tabuada do ${boss.tabuada}${
                !isUnlocked ? ", bloqueado" : ""
              }${isDefeated ? ", derrotado" : ""}`}
              onClick={() => isUnlocked && pickBoss(boss.tabuada)}
              onKeyDown={(e) => {
                if (isUnlocked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  pickBoss(boss.tabuada);
                }
              }}
              className={`${baseClasses} ${stateClasses}`}
            >
              <div
                className="text-5xl leading-none"
                style={{ filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.5))" }}
              >
                {isUnlocked ? boss.emoji : "❓"}
              </div>
              <div className="font-[family-name:var(--font-pixel)] text-[9px] leading-tight text-pixel-gold text-shadow-pixel">
                {isUnlocked ? boss.name : "???"}
              </div>
              <div className="font-[family-name:var(--font-pixel)] text-[8px] text-pixel-blue">
                {world ? `${world.emoji} ×${boss.tabuada}` : `×${boss.tabuada}`}
              </div>
              <div className="font-[family-name:var(--font-pixel)] text-[7px] text-pixel-red">
                {"❤️".repeat(Math.min(boss.hp, 5))}
                {boss.hp > 5 ? `+${boss.hp - 5}` : ""}
              </div>

              {!isUnlocked && (
                <div className="absolute right-1 top-1 text-base" aria-hidden>
                  🔒
                </div>
              )}
              {isDefeated && (
                <div
                  className="absolute -right-1 -top-1 text-2xl"
                  aria-hidden
                  style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.6))" }}
                >
                  👑
                </div>
              )}
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
        💡 PASSA O MUNDO NA AVENTURA<br />PARA DESBLOQUEAR O BOSS
      </div>
    </Screen>
  );
}
