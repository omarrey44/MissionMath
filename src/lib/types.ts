export type Difficulty = "easy" | "medium" | "hard";

export type Topic =
  | "sumas"
  | "restas"
  | "multiplicaciones"
  | "divisiones"
  | "fracciones"
  | "decimales"
  | "problemas"
  | "mixtas";

export type AnswerKind = "int" | "decimal" | "fraction";

export interface ExercisePart {
  /** Label shown next to the input, e.g. "Cociente". Null when there is a single answer. */
  label: string | null;
  answer: string;
  kind: AnswerKind;
}

export interface Exercise {
  id: string;
  topic: Topic;
  question: string;
  hint: string;
  explanation: string;
  parts: ExercisePart[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Topic counter that unlocks it, or a special rule id. */
  rule:
    | { type: "topicCorrect"; topic: Topic; count: number }
    | { type: "missions"; count: number }
    | { type: "streak"; count: number };
}

export interface DayConfig {
  slug: string;
  name: string;
  topic: Topic;
  /** Topic used for the warm-up exercise. */
  warmupTopic: Topic;
  emoji: string;
  title: string;
}
