import { z } from 'zod';

const emptyToNull = (value: unknown) =>
    value === null || (typeof value === 'string' && value.trim() === '')
        ? null
        : value;

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

const updateUserBaseSchema = z.object({
    username: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(50).optional(),
    firstName: z.string().trim().min(1, 'Informe o nome').max(50).optional(),
    middleName: z
        .preprocess(emptyToNull, z.string().trim().max(50).nullable())
        .optional(),
    lastName: z.string().trim().min(1, 'Informe o sobrenome').max(50).optional(),
    email: z
        .preprocess(
            emptyToNull,
            z.string().email('Email inválido').toLowerCase().nullable(),
        )
        .optional(),
});

const atLeastOneField = (data: Record<string, unknown>) =>
    Object.keys(data).length > 0;

const atLeastOneFieldMessage = {
    message: 'Informe ao menos um campo para atualizar',
};

export const updateProfileSchema = updateUserBaseSchema.refine(
    atLeastOneField,
    atLeastOneFieldMessage,
);

export const updateUserSchema = updateUserBaseSchema
    .extend({
        circuitoId: z
            .preprocess(
                emptyToNull,
                z.string().trim().min(1).max(12).nullable(),
            )
            .optional(),
    })
    .refine(atLeastOneField, atLeastOneFieldMessage);

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Informe a senha atual'),
        newPassword: z.string().min(8, 'Mínimo de 8 caracteres').max(128),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'A nova senha deve ser diferente da senha atual',
        path: ['newPassword'],
    });

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, 'Mínimo de 8 caracteres').max(128),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
