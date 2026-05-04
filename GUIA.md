# 🎮 Tabuadas do Pedro — guia completo

Jogo de tabuadas estilo pixel-art com 3 modos, prémios e coleção de troféus.

## 🕹️ Modos de jogo

| Modo | Como funciona |
|---|---|
| 🗺️ **Aventura** | 10 perguntas sobre uma tabuada específica, **3 vidas**. Ganhas até 3 estrelas conforme a precisão. |
| 🎯 **Treino** | 10 perguntas, **5 vidas**. Podes escolher uma tabuada ou "mistura tudo". |
| 👹 **Boss Fight** | **60 segundos** para acertar o máximo possível. Mistura todas as tabuadas. 3 vidas. |

## 🌍 Os 10 Mundos (tabuadas da Aventura)

Cada tabuada é um mundo com tema próprio:

| Tabuada | Mundo |
|---|---|
| 1 | 🌱 Pradaria |
| 2 | 🌊 Oceano |
| 3 | 🌋 Vulcão |
| 4 | 🏰 Castelo |
| 5 | ⭐ Estrelas |
| 6 | 🌲 Floresta |
| 7 | 🏜️ Deserto |
| 8 | ❄️ Geleira |
| 9 | 🌌 Galáxia |
| 10 | 🌈 Arco-íris |

## 📊 Símbolos no ecrã (HUD)

- ❤️ **Vidas** — perdes uma quando erras. Se chegar a 0, o jogo acaba.
- 🪙 **Moedas / Pontuação** — +1 moeda por acerto. No fim ganhas todas as moedas da pontuação somadas ao total.
  - **Aventura/Treino:** +5 pontos por acerto
  - **Boss:** +10 pontos por acerto
- ⭐ **Estrelas totais** — soma das estrelas ganhas em cada mundo (máx. 30).
- 🔥 **Streak** — acertos seguidos. Errar volta a zero.
- **Q1, Q2…** ou **3/10** — pergunta atual / total.

## ⭐ Sistema de estrelas (só na Aventura)

Baseado na precisão (acertos ÷ total) no fim da ronda:

| Precisão | Resultado |
|---|---|
| ≥ 95% | 🌟 **PERFEITO!** — 3 estrelas |
| ≥ 75% | 🎉 **MUITO BEM!** — 2 estrelas |
| ≥ 50% | 👍 **BOM TRABALHO!** — 1 estrela |
| < 50% | 💪 **QUASE!** — 0 estrelas |

Só guarda o **melhor** resultado de cada mundo (não perdes estrelas se jogares pior depois).

## 🏆 Troféus (12 medalhas a colecionar)

| Troféu | Como ganhar |
|---|---|
| 🎖️ **PRIMEIRA VITÓRIA** | Acertar pelo menos 1 pergunta numa ronda |
| ⭐ **10 ESTRELAS** | Acumular 10 estrelas no total |
| 🌟 **20 ESTRELAS** | Acumular 20 estrelas no total |
| 🏆 **TODOS MUNDOS** | Passar (≥1 estrela) em todas as 10 tabuadas |
| 💯 **JOGO PERFEITO** | Aventura com 100% de acertos |
| 🔥 **STREAK 5** | 5 acertos seguidos |
| ⚡ **STREAK 10** | 10 acertos seguidos |
| 👹 **BOSS 50+** | Fazer 50+ pontos no Boss Fight |
| 💰 **500 MOEDAS** | Acumular 500 moedas no total |
| 2️⃣ **MESTRE DO 2** | 3 estrelas na tabuada do 2 |
| 5️⃣ **MESTRE DO 5** | 3 estrelas na tabuada do 5 |
| 🔟 **MESTRE DO 10** | 3 estrelas na tabuada do 10 |

## 💡 Detalhes que o Pedro pode não notar

- **Repetição inteligente:** quando ele erra uma conta, ela tem **30% de hipótese** de voltar a aparecer mais à frente — ajuda a fixar onde ele tem mais dificuldade.
- **Confettis 🎉** caem quando ganha 2-3 estrelas ou faz 50+ pontos no Boss.
- **Progresso é guardado** no telemóvel/computador (localStorage) — não se perde se fechar o jogo.
