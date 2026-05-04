import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { BADGES } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

export default function Collection() {
  const navigate = useNavigate();
  const { state } = usePlayerState();

  return (
    <Screen>
      <TopBar
        title="TROFÉUS"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(95px,1fr))] gap-3">
        {BADGES.map((b) => {
          const unlocked = !!state.badges[b.id];
          return (
            <div
              key={b.id}
              className={`
                flex aspect-square flex-col items-center justify-center gap-1
                border-4 p-1.5 text-center shadow-pixel
                ${
                  unlocked
                    ? "border-pixel-gold bg-gradient-to-br from-[#4a3f00] to-pixel-dark"
                    : "border-[#555] bg-pixel-dark"
                }
              `}
            >
              <div
                className={`text-3xl leading-none ${
                  unlocked ? "" : "opacity-30 grayscale"
                }`}
              >
                {unlocked ? b.emoji : "❓"}
              </div>
              <div
                className={`
                  font-[family-name:var(--font-pixel)] text-[7px] leading-snug
                  ${unlocked ? "text-pixel-gold" : "text-[#666]"}
                `}
              >
                {unlocked ? b.name : "???"}
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
