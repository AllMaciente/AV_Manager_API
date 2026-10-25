import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8, 'Mínimo de 8 caracteres').max(128),
});

export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;