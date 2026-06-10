"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, Home, Dumbbell, TrendingUp, Apple, Flame, Star } from "lucide-react";
import { useProgress } from "@/lib/store";
import { SwitchStudentButton } from "./SwitchStudentButton";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/practicar", label: "Practicar", icon: Dumbbell },
  { href: "/progreso", label: "Mi progreso", icon: TrendingUp },
  { href: "/maestra", label: "Modo Maestra", icon: Apple },
];

/** Desktop-only left sidebar with navigation and quick stats. */
export function Sidebar() {
  const pathname = usePathname();
  const { studentName, streak, stars, hasHydrated } = useProgress();

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-y-auto bg-white px-4 py-6 shadow-card lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2" aria-label="Ir al inicio">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-azul text-white shadow-boton">
          <Calculator className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-bold leading-tight text-tinta">
          Misión
          <br />
          Matemática
        </span>
      </Link>

      <nav className="flex flex-col gap-1.5" aria-label="Navegación principal">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-display text-sm font-bold transition-colors ${
                active
                  ? "bg-azul text-white shadow-boton"
                  : "text-tinta/60 hover:bg-cielo hover:text-azul"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-coral/15 to-amarillo-light/40 p-4"
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl shadow-card"
              aria-hidden="true"
            >
              <Flame className="h-5 w-5 fill-coral text-coral-dark" />
            </motion.span>
            <div>
              <p className="text-xs font-semibold text-tinta/60">Racha actual</p>
              <p className="font-display text-lg font-bold text-coral-dark">
                {hasHydrated ? streak : 0} {(hasHydrated ? streak : 0) === 1 ? "día" : "días"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stars card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-gradient-to-br from-cielo to-amarillo-light/30 p-4"
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-card"
              aria-hidden="true"
            >
              <Star className="h-5 w-5 fill-amarillo text-amarillo-dark" />
            </span>
            <div>
              <p className="text-xs font-semibold text-tinta/60">Tus estrellas</p>
              <p className="font-display text-lg font-bold text-azul">
                {hasHydrated ? stars : 0}
              </p>
            </div>
          </div>
        </motion.div>

        {hasHydrated && studentName && (
          <p className="px-2 font-display text-sm font-bold text-tinta/60">
            ¡Hola, {studentName}! 👋
          </p>
        )}
        <SwitchStudentButton variant="full" />
      </div>
    </aside>
  );
}
