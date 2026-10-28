import { z } from 'zod';

export const listUsersQuerySchema = z.object({
    search: z.string().trim().min(1).max(100).optional(),
    circuitoId: z.string().trim().min(1).max(12).optional(),
    isAdmin: z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
