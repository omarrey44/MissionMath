"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/lib/store";

/** First-visit modal asking for the student's name. */
export function NamePrompt() {
  const { studentName, setName, hasHydrated } = useProgress();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = hasHydrated && !studentName;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-tinta/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="name-title"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="card w-full max-w-md p-8 text-center"
          >
            <span className="text-5xl" aria-hidden="true">
              🎒
            </span>
            <h2 id="name-title" className="mt-3 font-display text-2xl font-bold text-tinta">
              ¡Bienvenido a tu misión!
            </h2>
            <p className="mt-2 text-tinta/70">
              ¿Cómo te llamas? Así podremos guardar tu progreso y tus estrellas.
            </p>
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) setName(value);
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Escribe tu nombre"
                aria-label="Tu nombre"
                maxLength={30}
                className="rounded-2xl border-2 border-azul/30 bg-cielo/50 px-4 py-3 text-center font-display text-xl text-tinta outline-none focus:border-azul"
              />
              <button type="submit" disabled={!value.trim()} className="btn-primary disabled:opacity-40">
                ¡Comenzar aventura! 🚀
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
