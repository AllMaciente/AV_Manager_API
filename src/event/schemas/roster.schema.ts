import z from 'zod';

export const rosterPeriodSchema = z.enum(['MORNING', 'AFTERNOON']);

export const createRosterSchema = z.object({
  eventId: z.string().min(12),
  date: z.iso.date(),
  period: rosterPeriodSchema,
  equipamentoId: z.string().min(12),
  userId: z.string().min(12),
});

export type createRosterDto = z.infer<typeof createRosterSchema>;

export const updateRosterSchema = z
  .object({
    eventId: z.string().min(12).optional(),
    date: z.iso.date().optional(),
    period: rosterPeriodSchema.optional(),
    equipamentoId: z.string().min(12).optional(),
    userId: z.string().min(12).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export type updateRosterDto = z.infer<typeof updateRosterSchema>;

export const listRostersQuerySchema = z.object({
  eventId: z.string().min(12).optional(),
  date: z.iso.date().optional(),
  period: rosterPeriodSchema.optional(),
  equipamentoId: z.string().min(12).optional(),
  userId: z.string().min(12).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type listRostersQueryDto = z.infer<typeof listRostersQuerySchema>;

export const listMyRostersQuerySchema = z.object({
  includePast: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type listMyRostersQueryDto = z.infer<typeof listMyRostersQuerySchema>;
