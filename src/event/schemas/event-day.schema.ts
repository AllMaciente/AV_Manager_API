import z from 'zod';

export const createEventDaySchema = z.object({
  eventId: z.string().min(12),
  date: z.iso.date(),
  description: z.string().optional(),
});

export type createEventDayDto = z.infer<typeof createEventDaySchema>;

export const listCreateEventDaySchema = z.array(createEventDaySchema);

export type listCreateEventDayDto = z.infer<typeof listCreateEventDaySchema>;

export const createEventDayBodySchema = createEventDaySchema.omit({
  eventId: true,
});

export type createEventDayBodyDto = z.infer<typeof createEventDayBodySchema>;

export const createEventDayBatchBodySchema = z
  .array(createEventDayBodySchema)
  .min(1);

export type createEventDayBatchBodyDto = z.infer<
  typeof createEventDayBatchBodySchema
>;

export const updateEventDaySchema = z.object({
  description: z.string().nullable().optional(),
});

export type updateEventDayDto = z.infer<typeof updateEventDaySchema>;
