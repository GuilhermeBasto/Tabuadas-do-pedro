import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";

export default function Training() {
  const navigate = useNavigate();

  function startTraining(tabuada: number) {
    sfx.click();
    navigate(`/play/training/${tabuada}`);
  }

  return (
    <Screen>
      <TopBar
        title="TREINO LIVRE"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

      <p className="my-2.5 text-center font-[family-name:var(--font-pixel)] text-xs text-pixel-blue">
        ESCOLHE A TABUADA
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(75px,1fr))] gap-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => startTraining(n)}
            className="
              pixel-btn flex aspect-square items-center justify-center
              bg-pixel-purple p-4 px-2 text-lg text-white
            "
          >
            {n}×
          </button>
        ))}
      </div>

      <button
        onClick={() => startTraining(0)}
        className="
          pixel-btn mx-auto mt-2.5 flex w-full max-w-[320px] items-center
          justify-center gap-3 bg-pixel-pink p-4 px-3 text-xs text-white
        "
      >
        <span className="text-3xl">🎲</span>
        <span>MISTURA TUDO</span>
      </button>
    </Screen>
  );
}
