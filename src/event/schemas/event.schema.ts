import z from "zod";

export const listEventsQuerySchema = z.object({
    search: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type listEventsQueryDto = z.infer<typeof listEventsQuerySchema>

export const EventSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    circuitoId: z.array(z.string().min(12)).optional()
})

export type EventDto = z.infer<typeof EventSchema>

export const eventCircuitBodySchema = z.object({
    circuitId: z.string().min(12),
})

export type eventCircuitBodyDto = z.infer<typeof eventCircuitBodySchema>