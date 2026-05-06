# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173 (hot reload).
- `npm run build` — Production build, output in `build/client/` (static SPA).
- `npm run typecheck` — Runs `react-router typegen && tsc`. **Run typegen before `tsc`**: route param types live in `.react-router/types/` and are regenerated from `app/routes.ts`.
- `npm start` — Serve the built SSR bundle (rarely used; SSR is disabled, prefer a static server like `npx serve build/client`).

There is no test runner and no linter configured.

## Architecture

This is a Portuguese-language PWA for practicing multiplication tables, built as a **client-side SPA** on React Router v7 (framework mode) with `ssr: false` in `react-router.config.ts`. The app deploys as static assets from `build/client/`.

### Routing

Routes are declared explicitly in `app/routes.ts` (not file-system based). The dynamic route `play/:mode/:tabuada?` is the game screen and dispatches on four `GameMode` values: `adventure | training | boss | endless`.

### State model

All player progress (`PlayerState`) is persisted in a single `localStorage` key (`tabuadas-pedro-v1`) and exposed via the `usePlayerState()` hook in `app/lib/storage.ts`. There is **no Context Provider, no Redux/Zustand**:

- Components in the same tab stay in sync via a custom `tabuadas:state-changed` DOM event dispatched on every save.
- Cross-tab sync uses the native `storage` event.
- `loadFromStorage` does a defensive merge against `DEFAULT_STATE`, so adding new fields to `PlayerState` does not break older saves — but every new field must have a default in `DEFAULT_STATE` (and nested objects like `inventory` need their own merge).

### Game session pattern (`app/routes/play.tsx`)

This is the only complex component and uses three deliberate patterns worth preserving:

1. **Mutable session in a ref, UI ticks in state.** `GameSession` lives in `useState<{ current: GameSession }>` (used as a ref-like holder) and is mutated directly during play. A separate `tick` `useState` is incremented to force re-renders only at controlled moments (new question, answer, end). This avoids re-render churn during animations.
2. **Replay via parent `key` remount.** The outer `Play` component renders `<PlaySession key={...}>`; bumping a `restartKey` remounts `PlaySession` for a clean reset. **Do not refactor this into manual state cleanup** — it intentionally relies on React unmount/mount.
3. **Pure logic in `lib/game.ts`.** `newGame`, `makeQuestion`, `computeEndResult` are pure functions over `GameSession`. Keep new game logic there, not in the component.

### Design system (Tailwind v4)

There is **no `tailwind.config.js`**. All design tokens are CSS variables inside `@theme { ... }` in `app/app.css`. Tailwind v4 auto-generates utilities from them: defining `--color-pixel-gold` produces `bg-pixel-gold`, `text-pixel-gold`, etc. Custom utilities that don't fit Tailwind's namespace (e.g. `text-shadow-pixel`) use `@utility` blocks in the same file. Add new tokens there, not in JS config.

### Audio

`app/lib/audio.ts` synthesises all SFX with the Web Audio API (`OscillatorNode`) — there are no audio files. Keep it that way to preserve bundle size and offline behaviour.

### PWA / service worker

`public/sw.js` is registered only in production (`import.meta.env.PROD`) from `root.tsx`. In dev, `root.tsx` actively unregisters any leftover SW and clears caches — without this, cached Vite chunks cause "two copies of React" errors on restart. To test offline behaviour, build first then serve `build/client/` over HTTP.

## Adding new content

The game is data-driven from `app/lib/constants.ts`. For most additions, edit constants and the affected route picks them up:

- **New boss**: add to `BOSSES`. The `/bosses` selection screen and boss combat in `play.tsx` read the array directly.
- **New power-up**: add to `SHOP_ITEMS`, extend `ShopItemId`, add a default to `EMPTY_INVENTORY` in `storage.ts`, and handle the effect in `usePowerUp()` inside `play.tsx`.
- **New badge/trophy**: add to `BADGES` and unlock it via `applyEndUpdates()` (or in the relevant flow, e.g. `shop.tsx` for the `shopper` badge). Add a hint to `BADGE_HINTS` in `GuideScroll.tsx`.
- **New game mode**: add to the `GameMode` union, then update `initSession()`, the `validMode` check, `advance()` end conditions, `computeEndResult()`, `applyEndUpdates()` if it persists progress, plus a button in `home.tsx` and a row in `GuideScroll`'s `ModosSection`.

## Conventions

- Path alias `~/` maps to `app/` (configured in `tsconfig.json` and `vite-tsconfig-paths`).
- Strings shown to the user are Portuguese (pt-PT). Keep new UI strings in Portuguese.
- TypeScript is strict with `verbatimModuleSyntax: true` — type-only imports must use `import type`.
