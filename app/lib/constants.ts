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
  { id: "boss50", emoji: "👹", name: "BOSS 50+" },
  { id: "rich", emoji: "💰", name: "500 MOEDAS" },
  { id: "master2", emoji: "2️⃣", name: "MESTRE DO 2" },
  { id: "master5", emoji: "5️⃣", name: "MESTRE DO 5" },
  { id: "master10", emoji: "🔟", name: "MESTRE DO 10" },
];

export type GameMode = "adventure" | "training" | "boss";
