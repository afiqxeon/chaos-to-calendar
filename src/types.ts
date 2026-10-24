import { z } from "zod";

export const ActionTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  reasoning: z.string().optional(),
  completed: z.boolean().optional()
});

export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startIso: z.string(),
  endIso: z.string(),
  isAllDay: z.boolean(),
  durationMinutes: z.number(),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["meeting", "deadline", "event"])
});

export const ExtractionResponseSchema = z.object({
  tasks: z.array(ActionTaskSchema),
  events: z.array(CalendarEventSchema)
});

export type ActionTask = z.infer<typeof ActionTaskSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

