"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, Dumbbell } from "lucide-react";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { StudentStats } from "@/components/StudentStats";
import { NamePrompt } from "@/components/NamePrompt";
import { useProgress } from "@/lib/store";
import { DAYS } from "@/lib/data";
import { todayWeekdayIndex } from "@/lib/date";

export default function HomePage() {
  const { studentName, hasHydrated } = useProgress();

  // Today's mission follows the real calendar (Chihuahua time);
  // weekends point to Monday's mission.
  const todayIdx = todayWeekdayIndex();
  const nextDay = DAYS[todayIdx === -1 ? 0 : todayIdx];

  return (
    <div className="flex flex-col gap-10">
      <NamePrompt />

      {/* Hero */}
      <section className="card relative overflow-hidden bg-gradient-to-br from-cielo via-white to-amarillo-light/40 p-8 md:p-12">
        <div className="relative z-10 max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-extrabold leading-tight text-tinta md:text-5xl"
          >
            Misión Matemática <span className="text-azul">de Vacaciones</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-lg text-tinta/70"
          >
            Practica unos minutos al día, gana estrellas y mejora tus habilidades
            matemáticas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link href={`/mision/${nextDay.slug}`} className="btn-primary">
              <Rocket className="h-5 w-5" aria-hidden="true" />
              Comenzar misión de hoy
            </Link>
            <Link href="/practicar" className="btn-secondary">
              <Dumbbell className="h-5 w-5" aria-hidden="true" />
              Practicar libremente
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 font-display text-sm font-semibold text-tinta/60"
          >
            Hecho con <span aria-hidden="true">❤️</span>
            <span className="sr-only">amor</span> por su maestra{" "}
            <span className="text-coral-dark">Marisol Licon</span>
          </motion.p>
        </div>

        {/* Animated illustration area */}
        <div
          className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none lg:block"
          aria-hidden="true"
        >
          <motion.div
            className="relative h-64 w-64"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute left-8 top-4 text-7xl">📚</span>
            <motion.span
              className="absolute right-6 top-0 text-5xl"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              ✏️
            </motion.span>
            <motion.span
              className="absolute bottom-10 left-0 text-5xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <span className="absolute bottom-0 right-10 text-6xl">🧮</span>
            <motion.span
              className="absolute left-24 top-24 font-display text-4xl font-bold text-azul/40"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              7×8
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {hasHydrated && studentName && (
        <section aria-label="Tu progreso">
          <StudentStats />
        </section>
      )}

      {/* Weekly calendar */}
      <WeeklyCalendar />
    </div>
  );
}
