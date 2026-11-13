import { z } from "zod";

const horaryHistoryTurnSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: z.string().max(2_000) }),
  // Initial judgments can be several thousand characters; retain them as context.
  z.object({ role: z.literal("assistant"), content: z.string().max(16_000) }),
]);

export const horaryFollowUpHistorySchema = z.array(horaryHistoryTurnSchema).max(20);
