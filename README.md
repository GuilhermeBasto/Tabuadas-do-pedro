# 🎮 Tabuadas do Pedro — versão React

App PWA para aprender as tabuadas, construída com **React 19**, **React Router v7 (framework mode)**, **Tailwind CSS v4** e **Vite 7**. Versão melhorada da app HTML standalone, agora com componentes reutilizáveis, rotas dedicadas e arquitectura escalável.

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
│   ├── home.tsx            # /             — Ecrã inicial com 4 modos
│   ├── adventure.tsx       # /adventure    — Mapa de mundos
│   ├── training.tsx        # /training     — Escolha de tabuada para treino
│   ├── play.tsx            # /play/:mode/:tabuada? — Ecrã de jogo
│   └── collection.tsx      # /collection   — Troféus
├── components/
│   ├── Screen.tsx          # Wrapper de layout + TopBar
│   ├── Modal.tsx           # Modal pixel-art reutilizável
│   ├── FeedbackOverlay.tsx # "CERTO!" / "= 12" overlay
│   └── Effects.tsx         # Hook para spawn de moedas/confetes
└── lib/
    ├── audio.ts            # Web Audio API beeps (sem ficheiros)
    ├── constants.ts        # WORLDS, BADGES, GameMode
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
2. Adiciona caso em `initSession()` em `play.tsx`.
3. Adiciona caso em `computeEndResult()` em `app/lib/game.ts`.
4. Adiciona botão na home em `app/routes/home.tsx`.

### Nova tabuada (até 12, por ex.)
1. Acrescenta entradas ao array `WORLDS` em `app/lib/constants.ts`.
2. Acrescenta um botão no grid de `app/routes/training.tsx` (ou faz o loop ir até 12).

### Novo troféu
1. Acrescenta entrada ao array `BADGES` em `app/lib/constants.ts`.
2. Acrescenta a lógica de unlock em `applyEndUpdates()` em `play.tsx`.

---

## 🐛 Troubleshooting

**`tailwindcss` não aplica estilos**: Confirma que `app.css` é importado no `root.tsx` (`import "./app.css"`) e que o plugin `@tailwindcss/vite` está em `vite.config.ts`.

**Service worker em desenvolvimento**: O SW só regista em produção (verifica `location.protocol`). Para testar offline, faz `npm run build` e serve `build/client/` com um servidor estático (`npx serve build/client`).

**Fontes não carregam em `file://`**: O Google Fonts não funciona com `file://` — sempre servir por HTTP/HTTPS.
