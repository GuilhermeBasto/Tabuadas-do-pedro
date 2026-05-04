# 🎮 Tabuadas do Pedro — versão React

App PWA para aprender as tabuadas, construída com **React 19**, **React Router v7 (framework mode)**, **Tailwind CSS v4** e **Vite 7**. Versão melhorada da app HTML standalone, agora com componentes reutilizáveis, rotas dedicadas e arquitectura escalável.

5 modos de jogo (Aventura, Treino, Bosses temáticos, Maratona, Loja), 10 chefes desbloqueáveis, power-ups compráveis e 15 troféus. Ver [GUIA.md](./GUIA.md) para o detalhe da jogabilidade.

---

## ⚡ Quick start

```bash
# Instalar dependências (requer Node 20+)
npm install

# Servidor de desenvolvimento (hot reload)
npm run dev

# Build de produção (output em build/client/)
npm run build

# Verificação de tipos
npm run typecheck
```

Abrir http://localhost:5173 depois do `npm run dev`.

---

## 🏗️ Stack

| Tecnologia | Versão | Porquê |
|------------|--------|--------|
| React | 19 | UI |
| React Router | 7 (framework mode) | Rotas, code splitting, type safety |
| Tailwind CSS | 4 | Design system via `@theme` no CSS (sem `tailwind.config.js`) |
| Vite | 7 | Build tool |
| TypeScript | 5.7 | Tipagem estática |

SSR está **desligado** (`react-router.config.ts: ssr: false`) — é uma SPA cliente-side que pode ser deployada em qualquer static host (Netlify, GitHub Pages, Cloudflare Pages, etc.).

---

## 📁 Estrutura

```
app/
├── app.css                 # Tailwind + design tokens (@theme) + keyframes
├── root.tsx                # App shell, fonts, manifest, background stars
├── routes.ts               # Configuração de rotas
├── routes/
│   ├── home.tsx            # /             — Ecrã inicial (6 botões em grid 2x3)
│   ├── adventure.tsx       # /adventure    — Mapa de mundos
│   ├── training.tsx        # /training     — Escolha de tabuada para treino
│   ├── bosses.tsx          # /bosses       — Selecção de chefe (10 bosses)
│   ├── shop.tsx            # /shop         — Loja de power-ups
│   ├── play.tsx            # /play/:mode/:tabuada? — Ecrã de jogo (4 modos)
│   └── collection.tsx      # /collection   — Troféus
├── components/
│   ├── Screen.tsx          # Wrapper de layout + TopBar
│   ├── Modal.tsx           # Modal pixel-art reutilizável
│   ├── FeedbackOverlay.tsx # "CERTO!" / "= 12" overlay
│   ├── GuideScroll.tsx     # Pergaminho de ajuda (4 tabs)
│   └── Effects.tsx         # Hook para spawn de moedas/confetes
└── lib/
    ├── audio.ts            # Web Audio API beeps (sem ficheiros)
    ├── constants.ts        # WORLDS, BOSSES, SHOP_ITEMS, BADGES, GameMode
    ├── game.ts             # Lógica pura: makeQuestion, computeEndResult, etc.
    └── storage.ts          # Hook usePlayerState (persiste em localStorage)

public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (network-first HTML, cache-first assets)
├── icon-192.png
└── icon-512.png
```

---

## 🎨 Design system

Todos os tokens estão em `app/app.css` dentro de `@theme`:

```css
@theme {
  --color-pixel-gold: #ffd700;
  --color-pixel-red: #ff3b3b;
  --font-pixel: "Press Start 2P", "Courier New", monospace;
  --shadow-pixel: 4px 4px 0 rgba(0, 0, 0, 0.4);
  --animate-bounce-slow: bounce-slow 2s ease-in-out infinite;
}
```

Tailwind v4 gera automaticamente classes a partir destas variáveis: `bg-pixel-gold`, `text-pixel-red`, `font-pixel`, `shadow-pixel`, `animate-bounce-slow`, etc.

Custom utilities (que não cabem no namespace do Tailwind) usam `@utility`:

```css
@utility text-shadow-pixel {
  text-shadow: 2px 2px 0 var(--color-pixel-dark);
}
```

---

## 🧠 Decisões importantes

### 1. SSR desligado
Esta app não beneficia de SSR (estado é só localStorage, conteúdo é estático). Desligar `ssr` simplifica deploy e remove problemas de hydration mismatch.

### 2. Estado global via custom event
`usePlayerState` partilha estado entre componentes na mesma tab via `CustomEvent` e entre tabs via `storage` event nativo — sem necessidade de Context Provider ou Zustand/Redux.

### 3. Game session em ref, UI em state
Em `play.tsx`, a `GameSession` vive num `useRef` para evitar re-renders durante animações. Um contador de tick em `useState` força re-render apenas em momentos controlados (nova pergunta, resposta, fim de jogo).

### 4. Replay via key remount
Para "jogar outra vez" a mesma rota, o componente `PlaySession` recebe uma `key` que muda quando se carrega em "OUTRA VEZ" — React desmonta e remonta limpamente, sem necessidade de reset manual de state.

### 5. Audio sem ficheiros
Todos os SFX são gerados com Web Audio API (`OscillatorNode`). Mantém o bundle pequeno e dá um som arcade autêntico.

---

## 📱 Instalar como app nativa

Depois de fazer deploy:

- **Android (Chrome)**: aparece banner ou toca no botão "📲 INSTALAR APP" no ecrã inicial.
- **iPhone (Safari)**: Partilhar → "Adicionar ao Ecrã Principal".

A app fica com ícone próprio, abre em ecrã inteiro, e funciona offline depois da primeira abertura.

---

## 🚀 Deploy

### Netlify
```bash
npm run build
# Arrasta a pasta `build/client/` para https://app.netlify.com/drop
```

### GitHub Pages
1. `npm run build`
2. Push da pasta `build/client/` para a branch `gh-pages` (ou usar GitHub Actions).
3. Settings → Pages → Source: `gh-pages` branch.

### Cloudflare Pages / Vercel
Liga o repo, define:
- Build command: `npm run build`
- Output directory: `build/client`

---

## 🎯 Adicionar novas funcionalidades

### Novo modo de jogo
1. Adiciona o tipo em `app/lib/constants.ts` (`GameMode`).
2. Adiciona caso em `initSession()` em `play.tsx` e no `validMode` check.
3. Trata o caso em `advance()` (condição de fim) e em `computeEndResult()` em `app/lib/game.ts`.
4. Trata-o em `applyEndUpdates()` se houver progresso a guardar.
5. Adiciona botão na home em `app/routes/home.tsx` e linha em `ModosSection` no `GuideScroll`.

### Nova tabuada (até 12, por ex.)
1. Acrescenta entradas ao array `WORLDS` em `app/lib/constants.ts`.
2. Acrescenta um botão no grid de `app/routes/training.tsx` (ou faz o loop ir até 12).
3. (Opcional) Acrescenta um boss correspondente em `BOSSES`.

### Novo boss
1. Adiciona entrada ao array `BOSSES` em `app/lib/constants.ts` (tabuada, hp, tempo, recompensa, gradiente).
2. O ecrã de selecção (`/bosses`) e a lógica de combate em `play.tsx` pegam automaticamente.

### Novo power-up
1. Adiciona entrada ao array `SHOP_ITEMS` em `app/lib/constants.ts` e estende `ShopItemId`.
2. Adiciona o efeito em `usePowerUp()` no `play.tsx`.
3. Inicializa o slot em `EMPTY_INVENTORY` em `app/lib/storage.ts`.

### Novo troféu
1. Acrescenta entrada ao array `BADGES` em `app/lib/constants.ts`.
2. Acrescenta a lógica de unlock em `applyEndUpdates()` em `play.tsx` (ou no fluxo relevante, ex: `shop.tsx` para o `shopper`).
3. Acrescenta hint em `BADGE_HINTS` no `GuideScroll`.

### Estado persistido — migração
`PlayerState` é carregado de `localStorage` com merge defensivo (`loadFromStorage` em `storage.ts`), por isso podes adicionar campos novos sem partir saves antigos. Confirma sempre que o novo campo tem default seguro em `DEFAULT_STATE`.

---

## 🐛 Troubleshooting

**`tailwindcss` não aplica estilos**: Confirma que `app.css` é importado no `root.tsx` (`import "./app.css"`) e que o plugin `@tailwindcss/vite` está em `vite.config.ts`.

**Service worker em desenvolvimento**: O SW só regista em produção (verifica `location.protocol`). Para testar offline, faz `npm run build` e serve `build/client/` com um servidor estático (`npx serve build/client`).

**Fontes não carregam em `file://`**: O Google Fonts não funciona com `file://` — sempre servir por HTTP/HTTPS.
