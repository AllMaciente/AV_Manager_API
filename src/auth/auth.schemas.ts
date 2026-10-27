import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
    value === null || (typeof value === 'string' && value.trim() === '')
        ? undefined
        : value;

export const registerSchema = z.object({
    username: z.string().min(3).max(50),
    firstName: z.string().trim().min(1, 'Informe o nome').max(50),
    middleName: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(50).optional(),
    ),
    lastName: z.string().trim().min(1, 'Informe o sobrenome').max(50),
    email: z.preprocess(
        emptyToUndefined,
        z.string().email().toLowerCase().optional(),
    ),
    password: z.string().min(8, 'Mínimo de 8 caracteres').max(128),
});

export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
