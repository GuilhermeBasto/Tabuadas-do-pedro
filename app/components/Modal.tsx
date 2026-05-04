import type { ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  icon?: string;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Pixel-art confirmation modal. Used for destructive actions (e.g. quit game).
 * Mounted at the layout root; renders only when `open` is true to avoid
 * flicker / unnecessary DOM weight.
 */
export function Modal({
  open,
  icon = "🤔",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "CANCELAR",
  variant = "default",
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-5"
      style={{ animation: "fade-in 0.2s ease-out" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="
          w-full max-w-sm border-[5px] border-pixel-gold bg-pixel-dark
          p-7 text-center shadow-pixel-lg animate-modal-pop
        "
      >
        <div className="mb-3.5 text-5xl leading-none">{icon}</div>
        <h2
          id="modal-title"
          className="mb-3 font-[family-name:var(--font-pixel)] text-sm leading-relaxed text-pixel-gold"
          style={{ textShadow: "2px 2px 0 var(--color-pixel-red)" }}
        >
          {title}
        </h2>
        {message && (
          <p className="mb-5 font-[family-name:var(--font-pixel)] text-[10px] leading-loose opacity-85">
            {message}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onCancel}
            className="pixel-btn min-w-[110px] flex-1 bg-pixel-green px-4 py-3.5 text-[11px] text-white"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`pixel-btn min-w-[110px] flex-1 px-4 py-3.5 text-[11px] text-white ${
              variant === "danger" ? "bg-pixel-red" : "bg-pixel-blue"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
