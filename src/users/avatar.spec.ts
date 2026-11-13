import { buildDefaultAvatarUrl, resolveAvatarUrl } from './avatar';

describe('avatar', () => {
  describe('buildDefaultAvatarUrl', () => {
    it('builds a dicebear url from the full name', () => {
      expect(
        buildDefaultAvatarUrl({
          firstName: 'João',
          middleName: 'da',
          lastName: 'Silva',
        }),
      ).toBe(
        'https://api.dicebear.com/10.x/initials/svg?backgroundColor=57386f&seed=Jo%C3%A3o%20da%20Silva',
      );
    });

    it('ignores missing or blank middle names', () => {
      expect(
        buildDefaultAvatarUrl({
          firstName: 'João',
          middleName: '   ',
          lastName: 'Silva',
        }),
      ).toBe(
        'https://api.dicebear.com/10.x/initials/svg?backgroundColor=57386f&seed=Jo%C3%A3o%20Silva',
      );
    });
  });

  describe('resolveAvatarUrl', () => {
    const user = { firstName: 'João', lastName: 'Silva' };

    it('keeps a custom avatar url', () => {
      expect(
        resolveAvatarUrl({ ...user, avatarUrl: 'https://example.com/me.png' }),
      ).toBe('https://example.com/me.png');
    });

    it('falls back to the default avatar url when none is set', () => {
      expect(resolveAvatarUrl({ ...user, avatarUrl: null })).toBe(
        buildDefaultAvatarUrl(user),
      );
    });
  });
});
