"use client";

import { useState } from "react";
import { Copy, Printer, Check } from "lucide-react";
import { TeacherRanking } from "@/components/TeacherRanking";
import { TeacherGate, TeacherSessionBar, useTeacherAccess } from "@/components/TeacherGate";
import { DAYS, PARENT_MESSAGE, TOPIC_LABELS, WEEK_DESCRIPTIONS, TOTAL_WEEKS } from "@/lib/data";
import { generateExercise } from "@/lib/generators";
import type { Exercise } from "@/lib/types";

export default function TeacherPage() {
  const { hasHydrated, isTeacher } = useTeacherAccess();
  const [copied, setCopied] = useState(false);
  const [examples, setExamples] = useState<Exercise[]>([]);

  async function copyParentMessage() {
    await navigator.clipboard.writeText(PARENT_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function showExamples() {
    setExamples(
      DAYS.map((d) => generateExercise(d.topic, "medium"))
    );
  }

  // Wait for localStorage hydration to avoid flashing the login form
  if (!hasHydrated) {
    return <div className="card mx-auto h-64 max-w-md animate-pulse" aria-busy="true" />;
  }

  if (!isTeacher) {
    return <TeacherGate />;
  }

  return (
    <div className="flex flex-col gap-8">
      <TeacherSessionBar />
      <header className="no-print">
        <h1 className="font-display text-3xl font-bold text-tinta">🍎 Modo Maestra</h1>
        <p className="mt-1 text-tinta/70">
          Plan semanal sugerido, temas incluidos y recursos para compartir con las
          familias.
        </p>
      </header>

      {/* Student ranking */}
      <TeacherRanking />

      {/* Weekly plan */}
      <section className="card p-6" aria-labelledby="plan-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="plan-title" className="font-display text-xl font-bold text-tinta">
            📋 Plan semanal sugerido
          </h2>
          <button onClick={() => window.print()} className="btn-ghost no-print text-sm">
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir resumen
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-azul/20 font-display text-sm text-azul">
                <th className="px-3 py-2">Día</th>
                <th className="px-3 py-2">Tema</th>
                <th className="px-3 py-2">Ejercicios</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((d) => (
                <tr key={d.slug} className="border-b border-tinta/10">
                  <td className="px-3 py-2.5 font-display font-bold text-tinta">
                    {d.emoji} {d.name}
                  </td>
                  <td className="px-3 py-2.5 text-tinta/80">{d.title}</td>
                  <td className="px-3 py-2.5 text-tinta/60">
                    11 ejercicios (3 niveles de dificultad) + práctica libre
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 font-display text-base font-bold text-tinta">
          Progresión por semanas
        </h3>
        <ul className="mt-2 space-y-1.5 text-sm text-tinta/80">
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
            <li key={w}>
              <span className="font-bold text-azul">Semana {w}:</span>{" "}
              {WEEK_DESCRIPTIONS[w]}
            </li>
          ))}
        </ul>
      </section>

      {/* Topics */}
      <section className="card p-6" aria-labelledby="topics-title">
        <h2 id="topics-title" className="font-display text-xl font-bold text-tinta">
          📚 Temas incluidos
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {Object.values(TOPIC_LABELS).map((label) => (
            <li
              key={label}
              className="rounded-full bg-cielo px-4 py-1.5 font-display text-sm font-bold text-azul"
            >
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Example exercises */}
      <section className="card no-print p-6" aria-labelledby="examples-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="examples-title" className="font-display text-xl font-bold text-tinta">
            ✏️ Ejercicios de ejemplo
          </h2>
          <button onClick={showExamples} className="btn-ghost text-sm">
            {examples.length ? "Generar otros" : "Ver ejemplos"}
          </button>
        </div>
        {examples.length > 0 && (
          <ul className="mt-4 space-y-3">
            {examples.map((ex, i) => (
              <li key={ex.id} className="rounded-2xl bg-cielo/50 p-4">
                <p className="font-display text-sm font-bold text-azul">
                  {DAYS[i].name} — {DAYS[i].title}
                </p>
                <p className="mt-1 font-semibold text-tinta">{ex.question}</p>
                <p className="mt-1 text-sm text-tinta/60">{ex.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Parent message */}
      <section className="card p-6" aria-labelledby="parents-title">
        <h2 id="parents-title" className="font-display text-xl font-bold text-tinta">
          💌 Mensaje para las familias
        </h2>
        <blockquote className="mt-3 rounded-2xl border-l-4 border-amarillo bg-amarillo-light/30 p-4 text-tinta/90">
          {PARENT_MESSAGE}
        </blockquote>
        <button onClick={copyParentMessage} className="btn-secondary no-print mt-4 text-sm">
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar mensaje
            </>
          )}
        </button>
      </section>
    </div>
  );
}
