import type { ReactNode } from "react";

/**
 * Standard screen container — centred, max-width capped, with safe-area padding.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <main
      className="
        relative z-[1] mx-auto flex w-full max-w-[600px] flex-col gap-4
        p-5 pt-[max(20px,env(safe-area-inset-top))]
        pb-[max(20px,env(safe-area-inset-bottom))]
        animate-screen-in
      "
    >
      {children}
    </main>
  );
}

export function TopBar({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  // Three-column grid with equal-width side cells guarantees the title is
  // geometrically centered regardless of which side controls are present.
  return (
    <div className="mb-2 grid grid-cols-[48px_1fr_48px] items-center gap-2.5">
      <div className="justify-self-start">
        {onBack && (
          <button
            onClick={onBack}
            className="pixel-btn h-12 w-12 bg-pixel-red text-base text-white border-[3px] shadow-pixel"
            aria-label="Voltar"
          >
            ←
          </button>
        )}
      </div>
      <h1 className="text-center font-[family-name:var(--font-pixel)] text-[clamp(13px,4vw,17px)] text-pixel-gold text-shadow-pixel">
        {title}
      </h1>
      <div />
    </div>
  );
}
