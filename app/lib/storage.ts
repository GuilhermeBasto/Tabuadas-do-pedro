import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tabuadas-pedro-v1";

export type PlayerState = {
  coins: number;
  totalStars: number;
  streak: number;
  worldStars: Record<number, number>;
  worldCleared: Record<number, boolean>;
  badges: Record<string, boolean>;
  bossHighScore: number;
};

export const DEFAULT_STATE: PlayerState = {
  coins: 0,
  totalStars: 0,
  streak: 0,
  worldStars: {},
  worldCleared: {},
  badges: {},
  bossHighScore: 0,
};

function loadFromStorage(): PlayerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveToStorage(state: PlayerState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Notify other components in this tab to re-read.
    window.dispatchEvent(new CustomEvent("tabuadas:state-changed"));
  } catch {
    /* ignore quota/private-mode failures */
  }
}

/**
 * usePlayerState — single source of truth for player progress, persisted to
 * localStorage. Stays in sync across components in the same tab via a custom
 * event, and across tabs via the native `storage` event.
 *
 * SSR is disabled (`react-router.config.ts`), so reading from localStorage
 * synchronously in the initial state is safe — no hydration mismatch risk.
 */
export function usePlayerState() {
  const [state, setState] = useState<PlayerState>(loadFromStorage);

  // Re-read from storage when notified (other components or other tabs)
  useEffect(() => {
    const refresh = () => setState(loadFromStorage());
    window.addEventListener("tabuadas:state-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("tabuadas:state-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = useCallback(
    (updater: (prev: PlayerState) => PlayerState) => {
      setState((prev) => {
        const next = updater(prev);
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  return { state, update };
}
