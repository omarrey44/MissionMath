"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Star, Zap } from "lucide-react";
import { useProgress } from "@/lib/store";
import { SwitchStudentButton } from "./SwitchStudentButton";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/practicar", label: "Practicar" },
  { href: "/progreso", label: "Mi progreso" },
  { href: "/maestra", label: "Modo Maestra" },
];

export function Header() {
  const pathname = usePathname();
  const { points, stars, streak, studentName, hasHydrated } = useProgress();

  return (
    <header className="no-print sticky top-0 z-30 border-b-2 border-azul/10 bg-white/90 backdrop-blur lg:border-none lg:bg-transparent lg:backdrop-blur-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Ir al inicio">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-azul text-white shadow-boton">
            <Calculator className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="hidden font-display text-lg font-bold text-tinta sm:block">
            Misión Matemática
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-2 font-display text-sm transition-colors ${
                pathname === item.href
                  ? "bg-azul text-white"
                  : "text-tinta/70 hover:bg-cielo hover:text-azul"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2" aria-label="Tus puntos y estrellas">
          {hasHydrated && studentName && (
            <span className="max-w-[110px] truncate font-display text-sm font-bold text-tinta/70 sm:max-w-[160px]">
              ¡Hola, {studentName}!
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-amarillo-light px-3 py-1.5 font-display text-sm font-bold text-tinta">
            <Star className="h-4 w-4 fill-amarillo-dark text-amarillo-dark" aria-hidden="true" />
            {hasHydrated ? stars : 0}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-cielo px-3 py-1.5 font-display text-sm font-bold text-azul">
            <Zap className="h-4 w-4 fill-azul text-azul" aria-hidden="true" />
            {hasHydrated ? points : 0}
          </span>
          {hasHydrated && streak > 0 && (
            <span className="hidden items-center gap-1 rounded-full bg-coral/15 px-3 py-1.5 font-display text-sm font-bold text-coral-dark sm:flex">
              🔥 {streak}
            </span>
          )}
          {/* Desktop has this button in the sidebar */}
          <span className="lg:hidden">
            <SwitchStudentButton variant="icon" />
          </span>
        </div>
      </div>
    </header>
  );
}
