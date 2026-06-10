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
  // on weekends there is no daily mission, only free practice.
  const todayIdx = todayWeekdayIndex();
  const nextDay = todayIdx === -1 ? null : DAYS[todayIdx];

  return (
    <div className="flex flex-col gap-10">
      <NamePrompt />

      {/* Hero */}
      <section className="card relative overflow-hidden bg-gradient-to-br from-white via-cielo/60 to-cielo p-8 md:p-12">
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
            {nextDay && (
              <Link href={`/mision/${nextDay.slug}`} className="btn-primary">
                <Rocket className="h-5 w-5" aria-hidden="true" />
                Comenzar misión de hoy
              </Link>
            )}
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

        {/* Animated chalkboard illustration */}
        <div
          className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 select-none md:block"
          aria-hidden="true"
        >
          <motion.div
            className="relative h-60 w-72"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Chalkboard card */}
            <motion.div
              initial={{ rotate: -4, opacity: 0, scale: 0.9 }}
              animate={{ rotate: -4, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
              className="absolute left-10 top-6 h-36 w-48 rounded-2xl border-8 border-[#C68B5B] bg-[#2E5D4B] shadow-card-hover"
            >
              <motion.p
                className="mt-7 text-center font-display text-4xl font-bold text-white/95"
                animate={{ opacity: [1, 0.65, 1] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                7×8=?
              </motion.p>
              <span className="absolute bottom-2 left-3 h-1.5 w-8 rounded-full bg-white/60" />
              <span className="absolute bottom-2 left-12 h-1.5 w-4 rounded-full bg-amarillo/80" />
            </motion.div>

            {/* Floating school objects */}
            <motion.span
              className="absolute -left-2 bottom-10 text-5xl drop-shadow"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              📚
            </motion.span>
            <motion.span
              className="absolute right-2 top-0 text-4xl drop-shadow"
              animate={{ rotate: [12, 28, 12], y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ✏️
            </motion.span>
            <motion.span
              className="absolute right-0 bottom-14 text-4xl drop-shadow"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0.6 }}
            >
              🧮
            </motion.span>
            <motion.span
              className="absolute left-4 top-0 text-3xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 18, 0] }}
              transition={{ duration: 2.6, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <motion.span
              className="absolute right-16 bottom-2 text-2xl"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
            >
              ✨
            </motion.span>

            {/* Grass strip */}
            <div className="absolute bottom-0 left-6 right-4 flex justify-between">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="block h-6 w-3 origin-bottom rounded-t-full bg-exito/80"
                  animate={{ rotate: [0, i % 2 ? 8 : -8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
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
