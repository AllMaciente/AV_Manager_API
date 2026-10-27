import { z } from 'zod';

export const circuitoBodySchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome').max(100),
});

export type CircuitoBodyDto = z.infer<typeof circuitoBodySchema>;
