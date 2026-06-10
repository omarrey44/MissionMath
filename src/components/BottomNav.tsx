"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, TrendingUp, Apple } from "lucide-react";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/practicar", label: "Practicar", icon: Dumbbell },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/maestra", label: "Maestra", icon: Apple },
];

/** Mobile-only bottom navigation, game-app style. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="no-print fixed bottom-0 left-0 right-0 z-30 border-t-2 border-azul/10 bg-white/95 backdrop-blur md:hidden"
      aria-label="Navegación inferior"
    >
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 font-display text-xs transition-colors ${
                active ? "text-azul" : "text-tinta/50"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-2xl transition-colors ${
                  active ? "bg-azul text-white" : ""
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
