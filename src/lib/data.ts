import type { BadgeDef, DayConfig, Topic } from "./types";

export const DAYS: DayConfig[] = [
  {
    slug: "lunes",
    name: "Lunes",
    topic: "restas",
    warmupTopic: "sumas",
    emoji: "✏️",
    title: "Sumas y restas",
  },
  {
    slug: "martes",
    name: "Martes",
    topic: "multiplicaciones",
    warmupTopic: "sumas",
    emoji: "✖️",
    title: "Multiplicaciones",
  },
  {
    slug: "miercoles",
    name: "Miércoles",
    topic: "divisiones",
    warmupTopic: "multiplicaciones",
    emoji: "➗",
    title: "Divisiones",
  },
  {
    slug: "jueves",
    name: "Jueves",
    topic: "fracciones",
    warmupTopic: "divisiones",
    emoji: "🍕",
    title: "Fracciones",
  },
  {
    slug: "viernes",
    name: "Viernes",
    topic: "decimales",
    warmupTopic: "fracciones",
    emoji: "🧮",
    title: "Decimales y problemas",
  },
];

export const TOTAL_WEEKS = 4;

export const WEEK_DESCRIPTIONS: Record<number, string> = {
  1: "Suma, resta, tablas de multiplicar y división exacta",
  2: "Números más grandes, división con residuo y fracciones simples",
  3: "Decimales, operaciones mixtas y más problemas razonados",
  4: "Repaso con retos mixtos",
};

export const TOPIC_LABELS: Record<Topic, string> = {
  sumas: "Sumas",
  restas: "Restas",
  multiplicaciones: "Multiplicaciones",
  divisiones: "Divisiones",
  fracciones: "Fracciones",
  decimales: "Decimales",
  problemas: "Problemas razonados",
  mixtas: "Operaciones mixtas",
};

export const TOPIC_EMOJIS: Record<Topic, string> = {
  sumas: "➕",
  restas: "➖",
  multiplicaciones: "✖️",
  divisiones: "➗",
  fracciones: "🍕",
  decimales: "🔢",
  problemas: "📖",
  mixtas: "🎲",
};

export const BADGES: BadgeDef[] = [
  {
    id: "explorador-sumas",
    name: "Explorador de Sumas",
    description: "Resuelve 5 sumas correctamente",
    emoji: "🧭",
    rule: { type: "topicCorrect", topic: "sumas", count: 5 },
  },
  {
    id: "maestro-restas",
    name: "Maestro de Restas",
    description: "Resuelve 5 restas correctamente",
    emoji: "🎓",
    rule: { type: "topicCorrect", topic: "restas", count: 5 },
  },
  {
    id: "multiplicador-pro",
    name: "Multiplicador Pro",
    description: "Resuelve 5 multiplicaciones correctamente",
    emoji: "⚡",
    rule: { type: "topicCorrect", topic: "multiplicaciones", count: 5 },
  },
  {
    id: "campeon-divisiones",
    name: "Campeón de Divisiones",
    description: "Resuelve 5 divisiones correctamente",
    emoji: "🏆",
    rule: { type: "topicCorrect", topic: "divisiones", count: 5 },
  },
  {
    id: "experto-fracciones",
    name: "Experto en Fracciones",
    description: "Resuelve 5 fracciones correctamente",
    emoji: "🍕",
    rule: { type: "topicCorrect", topic: "fracciones", count: 5 },
  },
  {
    id: "genio-decimal",
    name: "Genio Decimal",
    description: "Resuelve 5 ejercicios con decimales",
    emoji: "🧠",
    rule: { type: "topicCorrect", topic: "decimales", count: 5 },
  },
  {
    id: "rey-problemas",
    name: "Rey de Problemas Razonados",
    description: "Resuelve 5 problemas razonados",
    emoji: "👑",
    rule: { type: "topicCorrect", topic: "problemas", count: 5 },
  },
  {
    id: "primera-mision",
    name: "Primera Misión",
    description: "Completa tu primera misión diaria",
    emoji: "🚀",
    rule: { type: "missions", count: 1 },
  },
  {
    id: "semana-estrella",
    name: "Semana Estrella",
    description: "Completa 5 misiones diarias",
    emoji: "🌟",
    rule: { type: "missions", count: 5 },
  },
  {
    id: "racha-3",
    name: "Racha de Fuego",
    description: "Practica 3 días seguidos",
    emoji: "🔥",
    rule: { type: "streak", count: 3 },
  },
];

export const CORRECT_MESSAGES = [
  "¡Excelente!",
  "¡Misión cumplida!",
  "¡Muy bien, sigue así!",
  "¡Ganaste una estrella!",
  "¡Eres increíble!",
  "¡Lo lograste!",
];

export const INCORRECT_MESSAGES = [
  "Casi lo logras. Intenta revisar el procedimiento.",
  "Buen intento. Usa la pista y vuelve a probar.",
  "Recuerda revisar el signo de la operación.",
  "¡No te rindas! Inténtalo otra vez.",
];

export const PARENT_MESSAGE =
  "Durante vacaciones los alumnos podrán practicar matemáticas de lunes a viernes con misiones cortas. Cada día resolverán operaciones básicas y problemas razonados para reforzar suma, resta, multiplicación, división, fracciones y decimales.";

export const PRACTICE_TOPICS: Topic[] = [
  "sumas",
  "restas",
  "multiplicaciones",
  "divisiones",
  "fracciones",
  "decimales",
  "problemas",
  "mixtas",
];
