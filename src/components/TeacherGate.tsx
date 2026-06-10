"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";
import { useProgress } from "@/lib/store";

/** Username that unlocks Modo Maestra. Must match TEACHER_USER on the server. */
export const TEACHER_USERNAME = "YukiCM";

export function useTeacherAccess() {
  const { teacherUser, hasHydrated } = useProgress();
  return {
    hasHydrated,
    isTeacher: teacherUser === TEACHER_USERNAME,
  };
}

/** Login card shown in Modo Maestra until the teacher username is entered. */
export function TeacherGate() {
  const { setTeacherUser } = useProgress();
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === TEACHER_USERNAME) {
      setTeacherUser(value);
    } else {
      setWrong(true);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mx-auto max-w-md p-8 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        🍎
      </span>
      <h1 className="mt-3 font-display text-2xl font-bold text-tinta">Modo Maestra</h1>
      <p className="mt-2 text-tinta/70">
        Esta sección es solo para la maestra. Escribe tu usuario para entrar.
      </p>
      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setWrong(false);
          }}
          placeholder="Usuario de maestra"
          aria-label="Usuario de maestra"
          autoComplete="off"
          className="rounded-2xl border-2 border-azul/30 bg-cielo/50 px-4 py-3 text-center font-display text-xl text-tinta outline-none focus:border-azul"
        />
        {wrong && (
          <p role="alert" className="text-sm font-semibold text-error">
            Usuario incorrecto. Verifica con la administración.
          </p>
        )}
        <button type="submit" disabled={!value.trim()} className="btn-primary disabled:opacity-40">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          Entrar
        </button>
      </form>
    </motion.div>
  );
}

/** Small badge + logout for the unlocked teacher view. */
export function TeacherSessionBar() {
  const { setTeacherUser } = useProgress();
  return (
    <div className="no-print flex items-center justify-between rounded-2xl bg-exito/10 px-4 py-2.5">
      <span className="flex items-center gap-2 font-display text-sm font-bold text-exito">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Sesión: {TEACHER_USERNAME}
      </span>
      <button
        onClick={() => setTeacherUser("")}
        className="flex items-center gap-1.5 font-display text-sm font-bold text-tinta/50 transition-colors hover:text-error"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Salir
      </button>
    </div>
  );
}
