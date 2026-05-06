import { useNavigate } from "react-router";
import { Screen, TopBar } from "~/components/Screen";
import { sfx } from "~/lib/audio";
import { usePlayerState } from "~/lib/storage";

type MiniGame = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  level: "2.º ANO" | "3.º ANO";
  bg: string;
};

const GAMES: MiniGame[] = [
  {
    id: "multiplos",
    emoji: "🎯",
    name: "CAÇA AOS MÚLTIPLOS",
    desc: "Toca só nos múltiplos da tabuada!",
    level: "2.º ANO",
    bg: "bg-pixel-red",
  },
  {
    id: "fracoes",
    emoji: "🍕",
    name: "PIZZARIA",
    desc: "Serve a fração certa de piza.",
    level: "2.º ANO",
    bg: "bg-pixel-orange",
  },
  {
    id: "sequencia",
    emoji: "🔢",
    name: "NÚMERO EM FALTA",
    desc: "Descobre o número que falta na sequência.",
    level: "2.º ANO",
    bg: "bg-pixel-blue",
  },
  {
    id: "probabilidades",
    emoji: "🎲",
    name: "SACO DA SORTE",
    desc: "Possível, certo ou impossível?",
    level: "3.º ANO",
    bg: "bg-pixel-purple",
  },
];

export default function Escola() {
  const navigate = useNavigate();
  const { state } = usePlayerState();

  function go(id: string) {
    sfx.click();
    navigate(`/escola/${id}`);
  }

  return (
    <Screen>
      <TopBar
        title="ESCOLA"
        onBack={() => {
          sfx.click();
          navigate("/");
        }}
      />

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

      <p className="mt-1 text-center font-[family-name:var(--font-pixel)] text-[10px] leading-relaxed text-pixel-blue">
        JOGOS NOVOS<br />PARA APRENDER MAIS!
      </p>

      <div className="flex flex-col gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => go(g.id)}
            className={`
              pixel-btn flex items-center gap-3 p-3 text-left text-white
              ${g.bg}
            `}
          >
            <div
              className="
                flex h-16 w-16 shrink-0 items-center justify-center border-4
                border-pixel-dark bg-pixel-deep text-4xl shadow-pixel-sm
              "
            >
              {g.emoji}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="font-[family-name:var(--font-pixel)] text-[10px] text-pixel-gold text-shadow-pixel">
                {g.name}
              </div>
              <div className="text-[11px] leading-snug opacity-95">
                {g.desc}
              </div>
              <div
                className="
                  inline-block self-start border-2 border-pixel-dark
                  bg-pixel-dark px-1.5 py-0.5
                  font-[family-name:var(--font-pixel)] text-[8px] text-pixel-gold
                "
              >
                {g.level}
              </div>
            </div>
            <span className="shrink-0 text-2xl">▶</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
