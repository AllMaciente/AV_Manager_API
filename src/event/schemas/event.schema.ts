import z from 'zod';

export const includePastQuerySchema = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

export const listEventsQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  includePast: includePastQuerySchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type listEventsQueryDto = z.infer<typeof listEventsQuerySchema>;

export const listCircuitEventsQuerySchema = z.object({
  includePast: includePastQuerySchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type listCircuitEventsQueryDto = z.infer<
  typeof listCircuitEventsQuerySchema
>;

export const findEventQuerySchema = z.object({
  includePast: includePastQuerySchema,
});

export type findEventQueryDto = z.infer<typeof findEventQuerySchema>;

export const EventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  circuitoId: z.array(z.string().min(12)).optional(),
});

export type EventDto = z.infer<typeof EventSchema>;

export const eventCircuitBodySchema = z.object({
  circuitId: z.string().min(12),
});

export type eventCircuitBodyDto = z.infer<typeof eventCircuitBodySchema>;
