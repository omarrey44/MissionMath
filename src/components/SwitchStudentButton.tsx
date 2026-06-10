"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useProgress } from "@/lib/store";

interface SwitchStudentButtonProps {
  /** "icon" = compact for the top nav, "full" = labeled for the sidebar. */
  variant: "icon" | "full";
}

/**
 * Logs the current student out of this device (their progress stays in the
 * ranking DB and comes back when they re-enter their name). Two taps to
 * confirm; the confirmation resets itself after a few seconds.
 */
export function SwitchStudentButton({ variant }: SwitchStudentButtonProps) {
  const { studentName, switchStudent, hasHydrated } = useProgress();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (!hasHydrated || !studentName) return null;

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), 3500);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    switchStudent();
    router.push("/");
  }

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label={
          confirming ? "Confirmar cambio de alumno" : "Cambiar de alumno"
        }
        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 font-display text-xs font-bold transition-colors ${
          confirming
            ? "bg-coral text-white"
            : "bg-tinta/5 text-tinta/50 hover:bg-coral/15 hover:text-coral-dark"
        }`}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {confirming && "¿Salir?"}
      </motion.button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-display text-sm font-bold transition-colors ${
        confirming
          ? "bg-coral text-white"
          : "text-tinta/60 hover:bg-coral/10 hover:text-coral-dark"
      }`}
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      {confirming ? "¿Seguro? Toca otra vez" : "Cambiar de alumno"}
    </button>
  );
}
