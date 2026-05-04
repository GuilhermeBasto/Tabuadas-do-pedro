import { useCallback, useEffect, useState } from "react";
import type { ShopItemId } from "./constants";

const STORAGE_KEY = "tabuadas-pedro-v1";

export type Inventory = Record<ShopItemId, number>;

export const EMPTY_INVENTORY: Inventory = {
  hint: 0,
  skip: 0,
  life: 0,
  freeze: 0,
};

export type PlayerState = {
  coins: number;
  totalStars: number;
  streak: number;
  worldStars: Record<number, number>;
  worldCleared: Record<number, boolean>;
  badges: Record<string, boolean>;
  bossHighScore: number;
  endlessHighScore: number;
  inventory: Inventory;
  bossesDefeated: Record<number, boolean>;
};

export const DEFAULT_STATE: PlayerState = {
  coins: 0,
  totalStars: 0,
  streak: 0,
  worldStars: {},
  worldCleared: {},
  badges: {},
  bossHighScore: 0,
  endlessHighScore: 0,
  inventory: { ...EMPTY_INVENTORY },
  bossesDefeated: {},
};

function loadFromStorage(): PlayerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    // Merge defensively: older saves may not have inventory/bossesDefeated.
    return {
      ...DEFAULT_STATE,
      ...parsed,
      inventory: { ...EMPTY_INVENTORY, ...(parsed.inventory ?? {}) },
      bossesDefeated: { ...(parsed.bossesDefeated ?? {}) },
    };
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
