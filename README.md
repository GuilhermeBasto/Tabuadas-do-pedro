# 🎮 Tabuadas do Pedro

App PWA (Progressive Web App) para aprender as tabuadas a jogar.
Funciona no telemóvel, tablet e computador. Instalável e funciona offline.

## ✨ O que tem

- **🗺️ Aventura** — 10 mundos, um por tabuada (1× a 10×). Ganha 1, 2 ou 3 estrelas em cada mundo. Mundos desbloqueiam-se à medida que avanças.
- **🎯 Treino** — Pratica a tabuada que quiseres sem pressão (vidas infinitas).
- **👹 Boss Fight** — Modo desafio: 60 segundos para acertar o máximo possível.
- **🏆 Troféus** — 12 medalhas para colecionar (primeira vitória, sequências, mestre de tabuada, etc.).
- **🪙 Moedas e estrelas** — Recompensas por cada acerto e por completar mundos.

## 📚 Pedagogia

- Quando o Pedro erra, **a app mostra a resposta certa** (não penaliza, ensina).
- Perguntas erradas **voltam a aparecer mais tarde** na mesma sessão (repetição espaçada).
- Sons divertidos para acertos e erros, com confetes para vitórias perfeitas.
- **Sem anúncios, sem login, sem recolha de dados.** Tudo guardado no telemóvel.

## 🚀 Como pôr a funcionar

### Opção 1 — Abrir directamente
1. Descomprime o zip.
2. Abre `index.html` num browser moderno (Chrome, Safari, Firefox).
3. ⚠️ Para a PWA funcionar a 100% (instalar, offline), tem de ser servido por HTTP/HTTPS, não `file://`.

### Opção 2 — Servir localmente (recomendado para testes)
```bash
cd tabuadas-pedro
python3 -m http.server 8000
```
Depois abre `http://localhost:8000` no telemóvel (mesma rede WiFi) ou no browser do PC.

### Opção 3 — Publicar online (recomendado para o Pedro)
Faz upload da pasta para qualquer um destes serviços (todos grátis):
- **Netlify Drop** — https://app.netlify.com/drop (arrasta a pasta para o site, recebe um URL)
- **Vercel** — https://vercel.com
- **GitHub Pages** — Cria um repo, faz upload, activa Pages
- **Cloudflare Pages** — https://pages.cloudflare.com

Depois envia o link ao Pedro. Quando ele abrir no telemóvel, vai aparecer um botão "📲 INSTALAR APP" e fica com ícone no ecrã inicial como uma app normal.

## 📱 Instalar no telemóvel

- **Android (Chrome)**: aparece banner "Adicionar ao ecrã principal" ou usa o botão dentro da app.
- **iPhone (Safari)**: toca no botão Partilhar → "Adicionar ao Ecrã Principal".

Depois de instalada funciona offline e abre em ecrã inteiro como uma app nativa.

## 🛠️ Personalização rápida

Tudo está num único `index.html`. Coisas fáceis de mudar:

- **Nome do miúdo no título**: procura `DO PEDRO` no HTML.
- **Personagem hero**: procura `🦸` (linha do `hero-character`) e troca pelo emoji preferido.
- **Cores**: variáveis CSS no topo (`:root { --pixel-gold ... }`).
- **Adicionar mundos** (tabuadas além de 10): array `WORLDS` no JavaScript.
- **Tempo do Boss Fight**: procura `timeLimit: 60` e ajusta.
- **Critérios de estrelas**: na função `endGame()`, alterar os limiares de `accuracy`.

## 📦 Ficheiros

- `index.html` — A app inteira (HTML + CSS + JS num só ficheiro).
- `manifest.json` — Metadados da PWA (nome, ícones, cores).
- `sw.js` — Service Worker (faz a app funcionar offline).
- `icon-192.png`, `icon-512.png` — Ícones da app.

Diverte-te, Pedro! 🚀
