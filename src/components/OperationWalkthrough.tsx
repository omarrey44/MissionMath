"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { Exercise, Topic } from "@/lib/types";

interface WalkthroughStep {
  title: string;
  explanation: string;
  board: string;
}

const SUPPORTED_TOPICS: Topic[] = [
  "sumas",
  "restas",
  "multiplicaciones",
  "divisiones",
];

function operandsFromQuestion(exercise: Exercise): [number, number] | null {
  if (!SUPPORTED_TOPICS.includes(exercise.topic)) return null;
  const match = exercise.question.match(/(\d+)\s*[+−×÷]\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2])] : null;
}

function rightAlign(value: string | number, width: number): string {
  return String(value).padStart(width, " ");
}

function placeName(positionFromRight: number): string {
  return ["unidades", "decenas", "centenas", "unidades de millar"][
    positionFromRight
  ] ?? `posición ${positionFromRight + 1}`;
}

function additionSteps(a: number, b: number): WalkthroughStep[] {
  const digits = Math.max(String(a).length, String(b).length);
  const width = digits + 1;
  const top = rightAlign(a, width);
  const bottom = rightAlign(b, width);
  const result = Array(width).fill(" ") as string[];
  const carries = Array(width).fill(" ") as string[];
  const steps: WalkthroughStep[] = [];
  let carry = 0;

  for (let offset = 0; offset < digits; offset += 1) {
    const column = width - 1 - offset;
    const topDigit = Number(top[column] || 0);
    const bottomDigit = Number(bottom[column] || 0);
    const incoming = carry;
    const total = topDigit + bottomDigit + incoming;
    result[column] = String(total % 10);
    carry = Math.floor(total / 10);
    if (carry > 0) carries[column - 1] = String(carry);
    if (column === 1 && carry > 0) result[0] = String(carry);

    const sumText = `${topDigit} + ${bottomDigit}${incoming ? ` + ${incoming} que llevábamos` : ""} = ${total}.`;
    const action =
      total >= 10
        ? ` Escribimos ${total % 10} y llevamos ${carry}.`
        : ` Escribimos ${total}.`;

    steps.push({
      title: `Sumamos las ${placeName(offset)}`,
      explanation: sumText + action,
      board: `Llevamos  ${carries.join("")}\n          ${top}\n        + ${bottom}\n        ${"─".repeat(width + 2)}\n          ${result.join("")}`,
    });
  }

  return steps;
}

function subtractionSteps(a: number, b: number): WalkthroughStep[] {
  const width = Math.max(String(a).length, String(b).length);
  const top = String(a).padStart(width, "0").split("").map(Number);
  const bottom = String(b).padStart(width, "0").split("").map(Number);
  const visibleTop = rightAlign(a, width);
  const visibleBottom = rightAlign(b, width);
  const result = Array(width).fill(" ") as string[];
  const steps: WalkthroughStep[] = [];

  for (let offset = 0; offset < width; offset += 1) {
    const column = width - 1 - offset;
    const originalTopDigit = top[column];
    let borrowText = "";

    if (top[column] < bottom[column]) {
      let donor = column - 1;
      while (donor >= 0 && top[donor] === 0) donor -= 1;
      if (donor >= 0) {
        top[donor] -= 1;
        for (let i = donor + 1; i < column; i += 1) top[i] = 9;
        top[column] += 10;
        borrowText = ` Como ${originalTopDigit} es menor que ${bottom[column]}, pedimos prestado a la columna de la izquierda; si hay ceros en medio, se convierten en 9. Aquí quedan ${top[column]}.`;
      }
    }

    const difference = top[column] - bottom[column];
    result[column] = column === 0 && difference === 0 ? " " : String(difference);
    steps.push({
      title: `Restamos las ${placeName(offset)}`,
      explanation: `${borrowText} Ahora ${top[column]} − ${bottom[column]} = ${difference}. Escribimos ${difference}.`.trim(),
      board: `          ${visibleTop}\n        − ${visibleBottom}\n        ${"─".repeat(width + 2)}\n          ${result.join("")}`,
    });
  }

  return steps;
}

function multiplicationSteps(a: number, b: number): WalkthroughStep[] {
  const multiplierDigits = String(b).split("").reverse().map(Number);
  const partials: number[] = [];
  const finalResult = a * b;
  const width = Math.max(String(a).length, String(b).length + 1, String(finalResult).length) + 1;
  const steps: WalkthroughStep[] = [];

  multiplierDigits.forEach((digit, offset) => {
    const partial = a * digit * 10 ** offset;
    partials.push(partial);
    const rows = partials
      .map((value, index) => {
        const prefix = index === 0 ? "  " : "+ ";
        return `${prefix}${rightAlign(value, width)}`;
      })
      .join("\n");
    const zeroText = offset > 0 ? ` Agregamos ${offset === 1 ? "un cero" : `${offset} ceros`} porque trabajamos con ${placeName(offset)}.` : "";

    steps.push({
      title: `Multiplicamos por las ${placeName(offset)}`,
      explanation: `${digit} × ${a} = ${a * digit}.${zeroText}`,
      board: `  ${rightAlign(a, width)}\n× ${rightAlign(b, width)}\n${"─".repeat(width + 2)}\n${rows}`,
    });
  });

  if (partials.length > 1) {
    const rows = partials
      .map((value, index) => `${index === 0 ? "  " : "+ "}${rightAlign(value, width)}`)
      .join("\n");
    steps.push({
      title: "Sumamos los resultados parciales",
      explanation: `${partials.join(" + ")} = ${finalResult}. Ese es el producto final.`,
      board: `  ${rightAlign(a, width)}\n× ${rightAlign(b, width)}\n${"─".repeat(width + 2)}\n${rows}\n${"─".repeat(width + 2)}\n  ${rightAlign(finalResult, width)}`,
    });
  }

  return steps;
}

function divisionSteps(dividend: number, divisor: number): WalkthroughStep[] {
  if (divisor === 0) return [];
  const dividendDigits = String(dividend).split("").map(Number);
  const quotientSlots = Array(dividendDigits.length).fill(" ") as string[];
  const steps: WalkthroughStep[] = [];
  let current = 0;
  let remainder = 0;
  let started = false;

  dividendDigits.forEach((digit, index) => {
    current = remainder * 10 + digit;
    const isLastDigit = index === dividendDigits.length - 1;
    if (!started && current < divisor && !isLastDigit) {
      remainder = current;
      return;
    }

    started = true;
    const quotientDigit = Math.floor(current / divisor);
    const product = quotientDigit * divisor;
    remainder = current - product;
    quotientSlots[index] = String(quotientDigit);
    const nextDigit = dividendDigits[index + 1];
    const nextAction =
      nextDigit === undefined
        ? remainder === 0
          ? " La división es exacta."
          : ` Terminamos con residuo ${remainder}.`
        : ` Después bajamos el ${nextDigit}.`;

    steps.push({
      title: `¿Cuántas veces cabe ${divisor} en ${current}?`,
      explanation: `Cabe ${quotientDigit} ${quotientDigit === 1 ? "vez" : "veces"}. ${quotientDigit} × ${divisor} = ${product}; restamos ${current} − ${product} = ${remainder}.${nextAction}`,
      board: `       ${quotientSlots.join("")}\n     ┌${"─".repeat(dividendDigits.length + 2)}\n  ${divisor}  │ ${dividend}\n\n  Paso: ${rightAlign(current, 3)} − ${rightAlign(product, 3)} = ${remainder}`,
    });
  });

  return steps;
}

function createSteps(exercise: Exercise): WalkthroughStep[] {
  const operands = operandsFromQuestion(exercise);
  if (!operands) return [];
  const [a, b] = operands;
  if (exercise.topic === "sumas") return additionSteps(a, b);
  if (exercise.topic === "restas") return subtractionSteps(a, b);
  if (exercise.topic === "multiplicaciones") return multiplicationSteps(a, b);
  return divisionSteps(a, b);
}

export function OperationWalkthrough({ exercise }: { exercise: Exercise }) {
  const steps = useMemo(() => createSteps(exercise), [exercise]);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  if (steps.length === 0) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setStepIndex(0);
          setOpen(true);
        }}
        className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-azul/25 bg-cielo/60 px-4 py-2.5 font-display font-bold text-azul transition-colors hover:border-azul hover:bg-cielo focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo"
      >
        <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        Ver cómo se resuelve paso a paso
      </button>
    );
  }

  return (
    <section
      className="mt-4 overflow-hidden rounded-3xl border-2 border-azul/20 bg-cielo/45"
      aria-label="Procedimiento paso a paso"
    >
      <div className="flex items-center justify-between gap-3 border-b-2 border-azul/10 bg-white/75 px-4 py-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-azul">
            Método de cuaderno
          </p>
          <p className="text-sm font-semibold text-tinta/70">
            Paso {stepIndex + 1} de {steps.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-tinta/60 transition-colors hover:bg-cielo hover:text-tinta focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo"
          aria-label="Cerrar explicación paso a paso"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex gap-1.5" aria-hidden="true">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= stepIndex ? "bg-azul" : "bg-azul/15"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepIndex}
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            aria-live="polite"
          >
            <h3 className="font-display text-xl font-bold text-tinta">
              {step.title}
            </h3>
            <p className="mt-1 leading-relaxed text-tinta/80">
              {step.explanation}
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border-2 border-dashed border-azul/25 bg-white p-4 font-mono text-lg font-bold leading-relaxed text-tinta shadow-card sm:text-xl">
              {step.board}
            </pre>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
            className="btn-ghost min-h-12 px-4 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Anterior
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary min-h-12 px-5"
            >
              ¡Entendido!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}
              className="btn-primary min-h-12 px-5"
            >
              Siguiente paso
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
