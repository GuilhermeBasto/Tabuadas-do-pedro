import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { WORLDS } from "~/lib/constants";
import { usePlayerState } from "~/lib/storage";

export default function Adventure() {
  const navigate = useNavigate();
  const { state } = usePlayerState();

  function selectWorld(num: number) {
    sfx.click();
    navigate(`/play/adventure/${num}`);
  }

  return (
    <Screen>
      <TopBar
        title="AVENTURA"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3.5 py-1.5">
        {WORLDS.map((w, i) => {
          const stars = state.worldStars[w.num] || 0;
          const prevWorld = WORLDS[i - 1];
          const isLocked = i > 0 && !state.worldCleared[prevWorld.num];
          const isComplete = stars === 3;

          const baseClasses =
            "relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 border-4 p-3.5 px-2 text-center shadow-pixel transition-transform active:translate-x-0.5 active:translate-y-0.5";

          let stateClasses = "border-pixel-blue bg-pixel-dark";
          if (isLocked) stateClasses = "border-[#555] bg-pixel-dark opacity-40 cursor-not-allowed";
          else if (isComplete)
            stateClasses =
              "border-pixel-gold bg-gradient-to-br from-[#4a3f00] to-pixel-dark";

          return (
            <div
              key={w.num}
              role="button"
              tabIndex={isLocked ? -1 : 0}
              aria-disabled={isLocked}
              aria-label={`Tabuada do ${w.num}, ${stars} de 3 estrelas${isLocked ? ", bloqueado" : ""}`}
              onClick={() => !isLocked && selectWorld(w.num)}
              onKeyDown={(e) => {
                if (!isLocked && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  selectWorld(w.num);
                }
              }}
              className={`${baseClasses} ${stateClasses}`}
            >
              <div
                className="text-4xl leading-none"
                style={{ filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.4))" }}
              >
                {w.emoji}
              </div>
              <div className="font-[family-name:var(--font-pixel)] text-lg text-pixel-gold text-shadow-pixel">
                {w.num}×
              </div>
              <div className="flex gap-0.5 text-sm">
                {"⭐".repeat(stars) + "☆".repeat(3 - stars)}
              </div>
              {isLocked && (
                <div className="absolute right-1 top-1 text-lg" aria-hidden>
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
