import { z } from 'zod'

export const equipamentoBodySchema = z.object({
    name: z.string().trim().min(1, "Informe o nome").max(100)
});

export type equipamentoBodyDto = z.infer<typeof equipamentoBodySchema>;

export const setOrderBodySchema = z.object({
    equipamentoIds: z.array(z.string('uma lista de string').max(12)),
    removerAusentes: z.boolean().optional().default(true)
});

export type setOrderBodyDto = z.infer<typeof setOrderBodySchema>;