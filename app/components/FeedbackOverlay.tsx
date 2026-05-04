export function FeedbackOverlay({
  text,
  type,
}: {
  text: string;
  type: "correct" | "wrong";
}) {
  return (
    <div
      key={text + type}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div
        className={`
          font-[family-name:var(--font-pixel)] text-[clamp(36px,12vw,64px)]
          animate-feedback-pop
          ${type === "correct" ? "text-pixel-green" : "text-pixel-red"}
        `}
        style={{
          textShadow:
            "4px 4px 0 var(--color-pixel-dark), 0 0 30px rgba(255,255,255,0.5)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
