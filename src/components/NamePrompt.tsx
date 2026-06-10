"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useProgress } from "@/lib/store";

/** First-visit modal asking for the student's name. */
export function NamePrompt() {
  const { studentName, setName, restoreStudent, hasHydrated } = useProgress();
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = hasHydrated && !studentName;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name || checking) return;
    setChecking(true);
    try {
      // If this name already exists, log the student back into their
      // account instead of creating a duplicate.
      const res = await fetch(`/api/student?name=${encodeURIComponent(name)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setWelcomeBack(data.student.name);
          // Brief welcome-back moment before the modal closes
          setTimeout(() => restoreStudent(data.student), 1200);
          return;
        }
      }
      // Name is free (or the DB is unavailable): create the student locally
      setName(name);
    } catch {
      setName(name);
    } finally {
      setChecking(false);
    }
  }

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
            {welcomeBack ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
              >
                <span className="text-5xl" aria-hidden="true">
                  🎉
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-tinta">
                  ¡Bienvenido de nuevo, {welcomeBack}!
                </h2>
                <p className="mt-2 text-tinta/70">
                  Recuperamos tu progreso y tus estrellas…
                </p>
              </motion.div>
            ) : (
              <>
                <span className="text-5xl" aria-hidden="true">
                  🎒
                </span>
                <h2 id="name-title" className="mt-3 font-display text-2xl font-bold text-tinta">
                  ¡Bienvenido a tu misión!
                </h2>
                <p className="mt-2 text-tinta/70">
                  ¿Cómo te llamas? Si ya habías jugado antes, escribe el mismo
                  nombre para recuperar tu progreso.
                </p>
                <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Escribe tu nombre"
                    aria-label="Tu nombre"
                    maxLength={30}
                    disabled={checking}
                    className="rounded-2xl border-2 border-azul/30 bg-cielo/50 px-4 py-3 text-center font-display text-xl text-tinta outline-none focus:border-azul disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!value.trim() || checking}
                    className="btn-primary disabled:opacity-40"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Buscando tu progreso…
                      </>
                    ) : (
                      "¡Comenzar aventura! 🚀"
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
