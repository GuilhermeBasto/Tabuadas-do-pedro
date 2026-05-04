/**
 * PWA install-prompt capture.
 *
 * The browser fires `beforeinstallprompt` once, very early — often before
 * React has hydrated. Registering inside a component's useEffect misses it.
 * This module attaches the listener at import time so the event is captured
 * regardless of when the UI mounts.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let cached: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(e: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    cached = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn(cached));
  });
  window.addEventListener("appinstalled", () => {
    cached = null;
    listeners.forEach((fn) => fn(null));
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return cached;
}

export function subscribeInstallPrompt(
  fn: (e: BeforeInstallPromptEvent | null) => void,
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function triggerInstall(): Promise<boolean> {
  if (!cached) return false;
  await cached.prompt();
  const choice = await cached.userChoice;
  cached = null;
  listeners.forEach((fn) => fn(null));
  return choice.outcome === "accepted";
}
