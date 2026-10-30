import promptSync from "prompt-sync";

const prompt = promptSync();

export function preguntar(pregunta) {
  return String(prompt(pregunta) ?? "").trim();
}
