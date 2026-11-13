export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

/**
 * The client commonly sends history that already contains the just-submitted
 * user turn, while the server also receives that turn as `question`. Remove
 * only that trailing duplicate, keep the most recent prior context, then append
 * the current question exactly once.
 */
export function withCurrentQuestion(
  history: ConversationTurn[],
  question: string,
  maxPriorTurns = 12,
): ConversationTurn[] {
  const last = history.at(-1);
  const prior = last?.role === "user" && last.content.trim() === question.trim()
    ? history.slice(0, -1)
    : history;

  return [
    ...prior.slice(-maxPriorTurns),
    { role: "user", content: question },
  ];
}
