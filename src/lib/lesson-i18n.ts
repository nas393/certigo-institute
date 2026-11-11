import { useI18n } from "@/lib/i18n";

/** Lesson-reader labels. Portuguese is fully translated; other languages fall back to English. */
const EN = {
  walkthrough: "Walkthrough", quickCheck: "Quick check", caseLabel: "Case", tapCard: "Tap a card to see the definition.", tapReveal: "Tap to reveal",
  tryAgain: "Try again", topEffective: "Top = most effective", keyPoint: "Key point", back: "Back", next: "Next",
  notFound: "Lesson not found.", overview: "Overview", lessonCheck: "Lesson check", lesson: "Lesson", step: "Step", of: "of", shortSteps: "short steps",
  flip: "Flip through the key ideas, then tap Next below to start the lesson.", preparing: "This lesson's full text is being prepared.",
  readyNext: "Ready for the next lesson?", endCourse: "You've reached the end of the course.",
  passToSave: "Pass the lesson check to save your progress, then continue.", passAll: "Pass every lesson check to unlock the exam and earn your certificate.",
  nextLabel: "Next", nextLesson: "Next lesson", finish: "Finish: get certified", correct: "Correct.", notQuite: "Not quite. Review the lesson and try again.",
  checking: "Checking…", checkAnswer: "Check answer", signIn: "Sign in", signInTail: "to check your answer and save your progress.",
  getStarted: "Get started", wrapUp: "Wrap up", example: "Example", tools: "Tools", englishOnly: "This lesson is not yet available in your language. Showing English.",
  lessonsEyebrow: "Lessons", interactiveLessons: "interactive lessons", lessonsSub: "Short steps with slides, diagrams, workplace cases and quick checks. Free to study.",
  start: "Start", review: "Review", completed: "completed", slides: "slides", lessonsFree: "Lessons free", payOnly: "Pay only when you take the certificate exam.",
  aboutMin: "About {n} min of study", selfPaced: "Self-paced", questionExam: "{n}-question exam", startLesson1: "Start lesson 1", savePortal: "Save to my portal",
};
const PT: typeof EN = {
  walkthrough: "Passo a passo", quickCheck: "Verificação rápida", caseLabel: "Caso", tapCard: "Toque num cartão para ver a definição.", tapReveal: "Toque para ver",
  tryAgain: "Tentar de novo", topEffective: "Topo = mais eficaz", keyPoint: "Ponto-chave", back: "Voltar", next: "Seguinte",
  notFound: "Lição não encontrada.", overview: "Visão geral", lessonCheck: "Verificação da lição", lesson: "Lição", step: "Passo", of: "de", shortSteps: "passos curtos",
  flip: "Veja as ideias principais e toque em Seguinte para começar a lição.", preparing: "O texto completo desta lição está a ser preparado.",
  readyNext: "Pronto para a próxima lição?", endCourse: "Chegou ao fim do curso.",
  passToSave: "Acerte na verificação da lição para guardar o progresso e continue.", passAll: "Acerte em todas as verificações para desbloquear o exame e obter o certificado.",
  nextLabel: "A seguir", nextLesson: "Próxima lição", finish: "Concluir: obter certificado", correct: "Correto.", notQuite: "Ainda não. Reveja a lição e tente de novo.",
  checking: "A verificar…", checkAnswer: "Verificar resposta", signIn: "Inicie sessão", signInTail: "para verificar a resposta e guardar o progresso.",
  getStarted: "Para começar", wrapUp: "Para concluir", example: "Exemplo", tools: "Ferramentas", englishOnly: "Esta lição ainda não está disponível no seu idioma. A mostrar em inglês.",
  lessonsEyebrow: "Lições", interactiveLessons: "lições interativas", lessonsSub: "Passos curtos com diapositivos, diagramas, casos reais e verificações rápidas. Estudo gratuito.",
  start: "Começar", review: "Rever", completed: "concluídas", slides: "diapositivos", lessonsFree: "Lições grátis", payOnly: "Só paga quando fizer o exame de certificação.",
  aboutMin: "Cerca de {n} min de estudo", selfPaced: "Ao seu ritmo", questionExam: "Exame de {n} perguntas", startLesson1: "Começar a lição 1", savePortal: "Guardar no meu portal",
};
export type LessonLabels = typeof EN;
export const lessonLabels = (lang: string): LessonLabels => (lang === "pt" ? PT : EN);
export function useLessonLabels() { const { lang } = useI18n(); return lessonLabels(lang); }
