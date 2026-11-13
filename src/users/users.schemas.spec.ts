import {
  changePasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateUserSchema,
} from './users.schemas';

describe('users schemas', () => {
  describe('updateProfileSchema', () => {
    it('rejects an empty payload', () => {
      expect(updateProfileSchema.safeParse({}).success).toBe(false);
    });

    it('accepts partial data and normalizes fields', () => {
      const result = updateProfileSchema.parse({
        email: 'USER@EXAMPLE.COM',
        middleName: '  ',
      });

      expect(result).toEqual({ email: 'user@example.com', middleName: null });
    });
  });

  describe('updateUserSchema', () => {
    it('accepts circuitoId null to remove the link', () => {
      expect(updateUserSchema.parse({ circuitoId: null })).toEqual({
        circuitoId: null,
      });
    });

    it('accepts a circuitoId to change the link', () => {
      expect(updateUserSchema.parse({ circuitoId: 'Aw_M6jP36B8F' })).toEqual({
        circuitoId: 'Aw_M6jP36B8F',
      });
    });

    it('normalizes an empty circuitoId to null', () => {
      expect(updateUserSchema.parse({ circuitoId: '  ' })).toEqual({
        circuitoId: null,
      });
    });

    it('rejects a circuitoId longer than 12 characters', () => {
      expect(
        updateUserSchema.safeParse({ circuitoId: '1234567890123' }).success,
      ).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('requires the current password', () => {
      expect(
        changePasswordSchema.safeParse({ newPassword: 'novaSenha123' }).success,
      ).toBe(false);
    });

    it('rejects a new password equal to the current one', () => {
      expect(
        changePasswordSchema.safeParse({
          currentPassword: 'senhaAtual123',
          newPassword: 'senhaAtual123',
        }).success,
      ).toBe(false);
    });

    it('accepts a valid password change', () => {
      expect(
        changePasswordSchema.safeParse({
          currentPassword: 'senhaAtual123',
          newPassword: 'novaSenha123',
        }).success,
      ).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('rejects short passwords', () => {
      expect(resetPasswordSchema.safeParse({ newPassword: '123' }).success).toBe(
        false,
      );
    });
  });
});
