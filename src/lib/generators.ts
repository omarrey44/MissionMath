import type { Difficulty, Exercise, ExercisePart, Topic } from "./types";

// ---------- helpers ----------

let counter = 0;
function nextId(): string {
  counter += 1;
  return `ej-${Date.now()}-${counter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

function fmtDec(n: number): string {
  // Avoid floating point noise like 6.800000000000001
  return String(Math.round(n * 100) / 100);
}

function singlePart(answer: string, kind: ExercisePart["kind"]): ExercisePart[] {
  return [{ label: null, answer, kind }];
}

// ---------- answer checking ----------

/** Accepts "3,5" and "3.5"; fractions accept any equivalent form ("2/4" matches "1/2"). */
export function checkAnswer(part: ExercisePart, input: string): boolean {
  const clean = input.trim().replace(",", ".");
  if (clean === "") return false;

  if (part.kind === "int") {
    return Number(clean) === Number(part.answer);
  }
  if (part.kind === "decimal") {
    const value = Number(clean);
    if (Number.isNaN(value)) return false;
    return Math.abs(value - Number(part.answer)) < 0.005;
  }
  // fraction: answer stored as "a/b"
  const [ansNum, ansDen] = part.answer.split("/").map(Number);
  const m = clean.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const num = Number(m[1]);
    const den = Number(m[2]);
    if (den === 0) return false;
    return num * ansDen === ansNum * den;
  }
  // allow whole-number input when the fraction equals an integer
  const whole = Number(clean);
  if (!Number.isNaN(whole)) return whole * ansDen === ansNum;
  return false;
}

// ---------- generators ----------

export function generateAdditionExercise(difficulty: Difficulty): Exercise {
  const ranges = {
    easy: [2, 99],
    medium: [25, 999],
    hard: [250, 9999],
  } as const;
  const [min, max] = ranges[difficulty];
  const a = randInt(min, max);
  const b = randInt(min, max);
  return {
    id: nextId(),
    topic: "sumas",
    question: `${a} + ${b} = ?`,
    hint: "Suma primero las unidades, luego las decenas y sigue por posiciones.",
    explanation: `${a} + ${b} = ${a + b}. Puedes sumar columna por columna, llevando cuando pases de 9.`,
    parts: singlePart(String(a + b), "int"),
  };
}

export function generateSubtractionExercise(difficulty: Difficulty): Exercise {
  const ranges = {
    easy: [10, 99],
    medium: [50, 999],
    hard: [500, 9999],
  } as const;
  const [min, max] = ranges[difficulty];
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a]; // no negative results
  if (a === b) a += randInt(1, 9);
  return {
    id: nextId(),
    topic: "restas",
    question: `${a} − ${b} = ?`,
    hint: "Resta posición por posición. Si el dígito de arriba es menor, pide prestado.",
    explanation: `${a} − ${b} = ${a - b}. Comprueba sumando: ${a - b} + ${b} = ${a}.`,
    parts: singlePart(String(a - b), "int"),
  };
}

export function generateMultiplicationExercise(difficulty: Difficulty): Exercise {
  let a: number;
  let b: number;
  let hint: string;
  if (difficulty === "easy") {
    a = randInt(2, 10);
    b = randInt(2, 10);
    hint = `Recuerda la tabla del ${a}.`;
  } else if (difficulty === "medium") {
    a = randInt(12, 99);
    b = randInt(2, 9);
    hint = `Multiplica ${b} por las unidades de ${a} y luego por las decenas.`;
  } else {
    a = randInt(12, 99);
    b = randInt(11, 49);
    hint = "Multiplica por las unidades, luego por las decenas, y suma los resultados.";
  }
  return {
    id: nextId(),
    topic: "multiplicaciones",
    question: `${a} × ${b} = ?`,
    hint,
    explanation: `${a} × ${b} = ${a * b}.`,
    parts: singlePart(String(a * b), "int"),
  };
}

export function generateDivisionExercise(difficulty: Difficulty): Exercise {
  if (difficulty === "easy") {
    // exact division from times tables
    const divisor = randInt(2, 10);
    const quotient = randInt(2, 10);
    const dividend = divisor * quotient;
    return {
      id: nextId(),
      topic: "divisiones",
      question: `${dividend} ÷ ${divisor} = ?`,
      hint: `Piensa: ¿qué número multiplicado por ${divisor} da ${dividend}?`,
      explanation: `${dividend} ÷ ${divisor} = ${quotient}, porque ${quotient} × ${divisor} = ${dividend}.`,
      parts: singlePart(String(quotient), "int"),
    };
  }
  if (difficulty === "medium") {
    // larger exact division
    const divisor = randInt(2, 9);
    const quotient = randInt(11, 99);
    const dividend = divisor * quotient;
    return {
      id: nextId(),
      topic: "divisiones",
      question: `${dividend} ÷ ${divisor} = ?`,
      hint: `Divide cifra por cifra empezando por la izquierda.`,
      explanation: `${dividend} ÷ ${divisor} = ${quotient}, porque ${quotient} × ${divisor} = ${dividend}.`,
      parts: singlePart(String(quotient), "int"),
    };
  }
  // division with remainder: two answers
  const divisor = randInt(3, 9);
  const quotient = randInt(5, 30);
  const remainder = randInt(1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  return {
    id: nextId(),
    topic: "divisiones",
    question: `${dividend} ÷ ${divisor} — escribe el cociente y el residuo.`,
    hint: `Busca el número más grande que multiplicado por ${divisor} no se pase de ${dividend}.`,
    explanation: `${divisor} × ${quotient} = ${divisor * quotient}, y sobran ${remainder}. Cociente: ${quotient}, residuo: ${remainder}.`,
    parts: [
      { label: "Cociente", answer: String(quotient), kind: "int" },
      { label: "Residuo", answer: String(remainder), kind: "int" },
    ],
  };
}

export function generateFractionExercise(difficulty: Difficulty): Exercise {
  if (difficulty === "easy" || difficulty === "medium") {
    // same denominator, add or subtract
    const den = pick([4, 5, 6, 8, 10] as const);
    const isAdd = Math.random() < 0.6;
    let n1 = randInt(1, den - 2);
    let n2 = randInt(1, den - 1 - n1 > 0 ? den - 1 - n1 : 1);
    if (!isAdd && n2 > n1) [n1, n2] = [n2, n1];
    const raw = isAdd ? n1 + n2 : n1 - n2;
    const [sn, sd] = simplify(raw === 0 ? 0 : raw, den);
    const answer = raw === 0 ? "0/1" : `${sn}/${sd}`;
    const op = isAdd ? "+" : "−";
    return {
      id: nextId(),
      topic: "fracciones",
      question: `${n1}/${den} ${op} ${n2}/${den} = ?`,
      hint: "Cuando el denominador es igual, solo se suman o restan los numeradores.",
      explanation: `${n1} ${op} ${n2} = ${raw}, así que el resultado es ${raw}/${den}${raw !== 0 && (sn !== raw || sd !== den) ? `, que simplificado es ${sn}/${sd}` : ""}.`,
      parts: singlePart(answer, "fraction"),
    };
  }
  // different denominators (one is multiple of the other)
  const base = pick([2, 3, 4] as const);
  const mult = pick([2, 3] as const);
  const den2 = base * mult;
  const n1 = randInt(1, base - 1 > 0 ? base - 1 : 1);
  const n2 = randInt(1, den2 - 1);
  const num = n1 * mult + n2;
  const [sn, sd] = simplify(num, den2);
  return {
    id: nextId(),
    topic: "fracciones",
    question: `${n1}/${base} + ${n2}/${den2} = ?`,
    hint: `Convierte ${n1}/${base} a ${mult * n1}/${den2} para que los denominadores sean iguales.`,
    explanation: `${n1}/${base} = ${n1 * mult}/${den2}. Entonces ${n1 * mult}/${den2} + ${n2}/${den2} = ${num}/${den2}${sn !== num ? `, simplificado: ${sn}/${sd}` : ""}.`,
    parts: singlePart(`${sn}/${sd}`, "fraction"),
  };
}

export function generateDecimalExercise(difficulty: Difficulty): Exercise {
  const kind =
    difficulty === "easy"
      ? pick(["suma", "resta"] as const)
      : difficulty === "medium"
        ? pick(["suma", "resta", "mult"] as const)
        : pick(["resta", "mult", "div"] as const);

  if (kind === "suma") {
    const a = randInt(10, 200) / 10;
    const b = randInt(10, 200) / 10;
    return {
      id: nextId(),
      topic: "decimales",
      question: `${fmtDec(a)} + ${fmtDec(b)} = ?`,
      hint: "Alinea los puntos decimales antes de sumar.",
      explanation: `${fmtDec(a)} + ${fmtDec(b)} = ${fmtDec(a + b)}.`,
      parts: singlePart(fmtDec(a + b), "decimal"),
    };
  }
  if (kind === "resta") {
    let a = randInt(50, 300) / 10;
    let b = randInt(10, 200) / 10;
    if (b > a) [a, b] = [b, a];
    return {
      id: nextId(),
      topic: "decimales",
      question: `${fmtDec(a)} − ${fmtDec(b)} = ?`,
      hint: "Alinea los puntos decimales y resta como siempre.",
      explanation: `${fmtDec(a)} − ${fmtDec(b)} = ${fmtDec(a - b)}.`,
      parts: singlePart(fmtDec(a - b), "decimal"),
    };
  }
  if (kind === "mult") {
    const a = randInt(11, 99) / 10;
    const b = randInt(2, 9);
    return {
      id: nextId(),
      topic: "decimales",
      question: `${fmtDec(a)} × ${b} = ?`,
      hint: `Multiplica ${a * 10} × ${b} y luego coloca el punto decimal (un lugar).`,
      explanation: `${a * 10} × ${b} = ${a * 10 * b}. Con un decimal: ${fmtDec(a * b)}.`,
      parts: singlePart(fmtDec(a * b), "decimal"),
    };
  }
  // simple decimal division: result has one decimal
  const b = randInt(2, 6);
  const result = randInt(11, 99) / 10;
  const a = result * b;
  return {
    id: nextId(),
    topic: "decimales",
    question: `${fmtDec(a)} ÷ ${b} = ?`,
    hint: `Piensa: ¿qué número multiplicado por ${b} da ${fmtDec(a)}?`,
    explanation: `${fmtDec(a)} ÷ ${b} = ${fmtDec(result)}, porque ${fmtDec(result)} × ${b} = ${fmtDec(a)}.`,
    parts: singlePart(fmtDec(result), "decimal"),
  };
}

export function generateMixedExercise(difficulty: Difficulty): Exercise {
  if (difficulty === "easy") {
    // a + b × c (multiplication first)
    const a = randInt(2, 20);
    const b = randInt(2, 9);
    const c = randInt(2, 9);
    return {
      id: nextId(),
      topic: "mixtas",
      question: `${a} + ${b} × ${c} = ?`,
      hint: "Primero la multiplicación, después la suma.",
      explanation: `Primero ${b} × ${c} = ${b * c}. Luego ${a} + ${b * c} = ${a + b * c}.`,
      parts: singlePart(String(a + b * c), "int"),
    };
  }
  if (difficulty === "medium") {
    // a × b − c
    const a = randInt(3, 12);
    const b = randInt(3, 12);
    const c = randInt(2, a * b - 1);
    return {
      id: nextId(),
      topic: "mixtas",
      question: `${a} × ${b} − ${c} = ?`,
      hint: "Primero la multiplicación, después la resta.",
      explanation: `${a} × ${b} = ${a * b}. Luego ${a * b} − ${c} = ${a * b - c}.`,
      parts: singlePart(String(a * b - c), "int"),
    };
  }
  // (a + b) ÷ c with parentheses, exact
  const c = randInt(2, 9);
  const quotient = randInt(3, 15);
  const total = c * quotient;
  const a = randInt(1, total - 1);
  const b = total - a;
  return {
    id: nextId(),
    topic: "mixtas",
    question: `(${a} + ${b}) ÷ ${c} = ?`,
    hint: "Resuelve primero lo que está dentro del paréntesis.",
    explanation: `${a} + ${b} = ${total}. Luego ${total} ÷ ${c} = ${quotient}.`,
    parts: singlePart(String(quotient), "int"),
  };
}

// ---------- word problems ----------

const NAMES = ["Ana", "Luis", "Sofía", "Carlos", "María", "Diego", "Valentina", "Mateo", "Camila", "Emiliano"];

type ProblemTemplate = (d: Difficulty) => Exercise;

const problemTemplates: ProblemTemplate[] = [
  // Tienda / dinero: multiplicación
  (d) => {
    const name = pick(NAMES);
    const qty = d === "easy" ? randInt(2, 5) : randInt(3, 9);
    const price = d === "easy" ? randInt(5, 20) : d === "medium" ? randInt(12, 45) : randInt(18, 95);
    const item = pick(["jugos", "paletas", "cuadernos", "stickers", "panes dulces"]);
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name} compró ${qty} ${item} de $${price} cada uno. ¿Cuánto pagó en total?`,
      hint: `Multiplica ${qty} × ${price}.`,
      explanation: `${qty} × $${price} = $${qty * price}.`,
      parts: singlePart(String(qty * price), "int"),
    };
  },
  // Dinero: resta
  (d) => {
    const name = pick(NAMES);
    const total = d === "easy" ? randInt(50, 150) : d === "medium" ? randInt(120, 500) : randInt(300, 1000);
    const spent = randInt(Math.floor(total * 0.2), total - 5);
    const item = pick(["una libreta", "un juguete", "unas crayolas", "una pelota", "un libro"]);
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name} tenía $${total} y gastó $${spent} en ${item}. ¿Cuánto dinero le quedó?`,
      hint: `Resta ${total} − ${spent}.`,
      explanation: `$${total} − $${spent} = $${total - spent}.`,
      parts: singlePart(String(total - spent), "int"),
    };
  },
  // Dulces: suma
  (d) => {
    const name1 = pick(NAMES);
    let name2 = pick(NAMES);
    while (name2 === name1) name2 = pick(NAMES);
    const a = d === "easy" ? randInt(8, 40) : randInt(25, 250);
    const b = d === "easy" ? randInt(8, 40) : randInt(25, 250);
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name1} juntó ${a} dulces y ${name2} juntó ${b}. ¿Cuántos dulces tienen entre los dos?`,
      hint: `Suma ${a} + ${b}.`,
      explanation: `${a} + ${b} = ${a + b} dulces.`,
      parts: singlePart(String(a + b), "int"),
    };
  },
  // Repartir comida: división exacta
  (d) => {
    const people = d === "easy" ? randInt(2, 5) : randInt(4, 9);
    const per = d === "easy" ? randInt(2, 8) : randInt(6, 25);
    const total = people * per;
    const item = pick(["galletas", "uvas", "fresas", "tacos", "empanadas"]);
    return {
      id: nextId(),
      topic: "problemas",
      question: `Hay ${total} ${item} para repartir entre ${people} amigos en partes iguales. ¿Cuántas le tocan a cada uno?`,
      hint: `Divide ${total} ÷ ${people}.`,
      explanation: `${total} ÷ ${people} = ${per} para cada amigo.`,
      parts: singlePart(String(per), "int"),
    };
  },
  // Pizza: fracciones
  () => {
    const name1 = pick(NAMES);
    let name2 = pick(NAMES);
    while (name2 === name1) name2 = pick(NAMES);
    const den = pick([6, 8, 10] as const);
    const a = randInt(1, Math.floor(den / 2) - 1);
    const b = randInt(1, Math.floor(den / 2));
    const [sn, sd] = simplify(a + b, den);
    return {
      id: nextId(),
      topic: "problemas",
      question: `Una pizza se dividió en ${den} partes. ${name1} comió ${a} ${a === 1 ? "parte" : "partes"} y ${name2} comió ${b}. ¿Qué fracción de la pizza comieron juntos? (escribe a/b)`,
      hint: `Suma las partes: ${a} + ${b}, sobre ${den}.`,
      explanation: `${a} + ${b} = ${a + b}, así que comieron ${a + b}/${den}${sn !== a + b ? ` = ${sn}/${sd}` : ""} de la pizza.`,
      parts: singlePart(`${sn}/${sd}`, "fraction"),
    };
  },
  // Distancia: decimales
  (d) => {
    const name = pick(NAMES);
    const a = randInt(10, d === "easy" ? 40 : 80) / 10;
    const b = randInt(10, d === "easy" ? 40 : 80) / 10;
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name} caminó ${fmtDec(a)} km el lunes y ${fmtDec(b)} km el martes. ¿Cuántos kilómetros caminó en total?`,
      hint: "Suma los dos números alineando el punto decimal.",
      explanation: `${fmtDec(a)} + ${fmtDec(b)} = ${fmtDec(a + b)} km.`,
      parts: singlePart(fmtDec(a + b), "decimal"),
    };
  },
  // Tiempo: multiplicación/suma
  (d) => {
    const name = pick(NAMES);
    const days = randInt(3, 6);
    const mins = d === "easy" ? randInt(10, 30) : randInt(15, 55);
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name} practica matemáticas ${mins} minutos al día durante ${days} días. ¿Cuántos minutos practica en total?`,
      hint: `Multiplica ${mins} × ${days}.`,
      explanation: `${mins} × ${days} = ${mins * days} minutos.`,
      parts: singlePart(String(mins * days), "int"),
    };
  },
  // Útiles escolares: dos pasos
  (d) => {
    const name = pick(NAMES);
    const pencils = randInt(2, 6);
    const pPrice = d === "easy" ? randInt(3, 8) : randInt(5, 15);
    const notebook = d === "easy" ? randInt(10, 25) : randInt(20, 60);
    const total = pencils * pPrice + notebook;
    return {
      id: nextId(),
      topic: "problemas",
      question: `${name} compró ${pencils} lápices de $${pPrice} cada uno y una libreta de $${notebook}. ¿Cuánto gastó en total?`,
      hint: `Primero ${pencils} × ${pPrice}, luego suma ${notebook}.`,
      explanation: `${pencils} × $${pPrice} = $${pencils * pPrice}. Más la libreta: $${pencils * pPrice} + $${notebook} = $${total}.`,
      parts: singlePart(String(total), "int"),
    };
  },
  // Deportes: división con residuo (solo hard)
  (d) => {
    if (d !== "hard") {
      // fallback: equipos exactos
      const teams = randInt(2, 6);
      const per = randInt(3, 8);
      const total = teams * per;
      return {
        id: nextId(),
        topic: "problemas",
        question: `En el recreo hay ${total} niños y forman ${teams} equipos iguales. ¿Cuántos niños hay en cada equipo?`,
        hint: `Divide ${total} ÷ ${teams}.`,
        explanation: `${total} ÷ ${teams} = ${per} niños por equipo.`,
        parts: singlePart(String(per), "int"),
      };
    }
    const per = randInt(4, 9);
    const teams = randInt(3, 7);
    const left = randInt(1, per - 1);
    const total = per * teams + left;
    return {
      id: nextId(),
      topic: "problemas",
      question: `Hay ${total} pelotas para guardar en cajas de ${per}. ¿Cuántas cajas completas se llenan y cuántas pelotas sobran?`,
      hint: `Divide ${total} ÷ ${per} y fíjate en lo que sobra.`,
      explanation: `${per} × ${teams} = ${per * teams}, sobran ${left}. Cajas: ${teams}, sobran: ${left}.`,
      parts: [
        { label: "Cajas completas", answer: String(teams), kind: "int" },
        { label: "Pelotas que sobran", answer: String(left), kind: "int" },
      ],
    };
  },
  // Recetas: decimales por entero
  (d) => {
    const cups = randInt(15, 35) / 10;
    const batch = d === "easy" ? 2 : randInt(2, 4);
    return {
      id: nextId(),
      topic: "problemas",
      question: `Una receta de galletas usa ${fmtDec(cups)} tazas de harina. Si haces ${batch} recetas, ¿cuántas tazas necesitas?`,
      hint: `Multiplica ${fmtDec(cups)} × ${batch}.`,
      explanation: `${fmtDec(cups)} × ${batch} = ${fmtDec(cups * batch)} tazas.`,
      parts: singlePart(fmtDec(cups * batch), "decimal"),
    };
  },
];

export function generateWordProblem(difficulty: Difficulty): Exercise {
  return pick(problemTemplates)(difficulty);
}

// ---------- dispatch ----------

const generatorByTopic: Record<Topic, (d: Difficulty) => Exercise> = {
  sumas: generateAdditionExercise,
  restas: generateSubtractionExercise,
  multiplicaciones: generateMultiplicationExercise,
  divisiones: generateDivisionExercise,
  fracciones: generateFractionExercise,
  decimales: generateDecimalExercise,
  problemas: generateWordProblem,
  mixtas: generateMixedExercise,
};

export function generateExercise(topic: Topic, difficulty: Difficulty): Exercise {
  return generatorByTopic[topic](difficulty);
}

/** Difficulty curve: week 1 easy → week 4 mixed review. */
export function difficultyForWeek(week: number): Difficulty {
  if (week <= 1) return "easy";
  if (week === 2) return "medium";
  return "hard";
}

/**
 * Builds the required mission exercises for a day:
 * 2 sumas, 2 restas, 2 multiplicaciones, 2 divisiones,
 * 2 of the day's special topic, and 1 word problem at the end.
 */
export function generateMission(dayTopic: Topic, difficulty: Difficulty): Exercise[] {
  // The four base operations are always practiced; the special slot adds
  // the day's theme (fracciones/decimales) or mixed operations otherwise.
  const baseOps: Topic[] = ["sumas", "restas", "multiplicaciones", "divisiones"];
  const special: Topic = baseOps.includes(dayTopic) ? "mixtas" : dayTopic;

  const exercises: Exercise[] = [];
  for (const topic of baseOps) {
    exercises.push(generateExercise(topic, difficulty));
    exercises.push(generateExercise(topic, difficulty));
  }
  exercises.push(generateExercise(special, difficulty));
  exercises.push(generateExercise(special, difficulty));
  exercises.push(generateWordProblem(difficulty));
  return exercises;
}

export const MISSION_SIZE = 11;
