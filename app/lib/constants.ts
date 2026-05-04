export type World = {
  num: number;
  emoji: string;
  name: string;
};

export const WORLDS: World[] = [
  { num: 1, emoji: "🌱", name: "Pradaria" },
  { num: 2, emoji: "🌊", name: "Oceano" },
  { num: 3, emoji: "🌋", name: "Vulcão" },
  { num: 4, emoji: "🏰", name: "Castelo" },
  { num: 5, emoji: "⭐", name: "Estrelas" },
  { num: 6, emoji: "🌲", name: "Floresta" },
  { num: 7, emoji: "🏜️", name: "Deserto" },
  { num: 8, emoji: "❄️", name: "Geleira" },
  { num: 9, emoji: "🌌", name: "Galáxia" },
  { num: 10, emoji: "🌈", name: "Arco-íris" },
];

export type Boss = {
  tabuada: number; // matches a world num; 0 = mega-boss (mistura tudo)
  emoji: string;
  name: string;
  hp: number;
  timeLimit: number; // seconds
  reward: number; // coin bonus on first defeat
  bgFrom: string;
  bgTo: string;
};

export const BOSSES: Boss[] = [
  { tabuada: 1, emoji: "🐛", name: "VERME GIGANTE", hp: 5, timeLimit: 90, reward: 30, bgFrom: "#4a7c1f", bgTo: "#1a3010" },
  { tabuada: 2, emoji: "🦑", name: "KRAKEN",         hp: 6, timeLimit: 90, reward: 40, bgFrom: "#1e3a8a", bgTo: "#0c1530" },
  { tabuada: 3, emoji: "🐲", name: "DRAGÃO LAVA",    hp: 6, timeLimit: 80, reward: 50, bgFrom: "#7c1f1f", bgTo: "#2a0808" },
  { tabuada: 4, emoji: "👻", name: "FANTASMA REI",   hp: 7, timeLimit: 80, reward: 60, bgFrom: "#3a2a5a", bgTo: "#15102a" },
  { tabuada: 5, emoji: "🌟", name: "ESTRELA NEGRA",  hp: 7, timeLimit: 75, reward: 70, bgFrom: "#5a4a1f", bgTo: "#1f1a08" },
  { tabuada: 6, emoji: "🐺", name: "LOBO ALFA",      hp: 8, timeLimit: 75, reward: 80, bgFrom: "#2a4a1f", bgTo: "#0c1808" },
  { tabuada: 7, emoji: "🦂", name: "ESCORPIÃO REI",  hp: 8, timeLimit: 70, reward: 90, bgFrom: "#7c5a1f", bgTo: "#2a1f08" },
  { tabuada: 8, emoji: "🧊", name: "GOLEM GELO",     hp: 9, timeLimit: 70, reward: 100, bgFrom: "#1f5a7c", bgTo: "#081f2a" },
  { tabuada: 9, emoji: "👾", name: "ALIEN MESTRE",   hp: 9, timeLimit: 65, reward: 120, bgFrom: "#4a1f7c", bgTo: "#15082a" },
  { tabuada: 10, emoji: "🐉", name: "DRAGÃO ANCIÃO", hp: 10, timeLimit: 60, reward: 150, bgFrom: "#7c1f5a", bgTo: "#2a0820" },
];

export type ShopItemId = "hint" | "skip" | "life" | "freeze";

export type ShopItem = {
  id: ShopItemId;
  emoji: string;
  name: string;
  desc: string;
  price: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "life",
    emoji: "💖",
    name: "VIDA EXTRA",
    desc: "Recupera +1 vida durante o jogo.",
    price: 30,
  },
  {
    id: "hint",
    emoji: "💡",
    name: "PISTA 50/50",
    desc: "Remove 2 respostas erradas.",
    price: 20,
  },
  {
    id: "skip",
    emoji: "⏭️",
    name: "SALTAR",
    desc: "Salta a pergunta sem perder vida.",
    price: 25,
  },
  {
    id: "freeze",
    emoji: "⏰",
    name: "CONGELAR",
    desc: "+10 segundos ao Boss (só Boss).",
    price: 40,
  },
];

export type Badge = {
  id: string;
  emoji: string;
  name: string;
};

export const BADGES: Badge[] = [
  { id: "firstWin", emoji: "🎖️", name: "PRIMEIRA VITÓRIA" },
  { id: "star10", emoji: "⭐", name: "10 ESTRELAS" },
  { id: "star20", emoji: "🌟", name: "20 ESTRELAS" },
  { id: "allWorlds", emoji: "🏆", name: "TODOS MUNDOS" },
  { id: "perfect", emoji: "💯", name: "JOGO PERFEITO" },
  { id: "streak5", emoji: "🔥", name: "STREAK 5" },
  { id: "streak10", emoji: "⚡", name: "STREAK 10" },
  { id: "boss50", emoji: "👹", name: "1º BOSS" },
  { id: "bossAll", emoji: "👑", name: "CAÇADOR LENDÁRIO" },
  { id: "endless25", emoji: "♾️", name: "MARATONISTA" },
  { id: "shopper", emoji: "🛒", name: "1ª COMPRA" },
  { id: "rich", emoji: "💰", name: "500 MOEDAS" },
  { id: "master2", emoji: "2️⃣", name: "MESTRE DO 2" },
  { id: "master5", emoji: "5️⃣", name: "MESTRE DO 5" },
  { id: "master10", emoji: "🔟", name: "MESTRE DO 10" },
];

export type GameMode = "adventure" | "training" | "boss" | "endless";
