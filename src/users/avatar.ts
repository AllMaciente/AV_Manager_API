type AvatarUser = {
    firstName: string;
    middleName?: string | null;
    lastName: string;
};

const AVATAR_BACKGROUND_COLOR = '57386f';

export const buildDefaultAvatarUrl = ({
    firstName,
    middleName,
    lastName,
}: AvatarUser) => {
    const fullname = [firstName, middleName, lastName]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part))
        .join(' ');

    return `https://api.dicebear.com/10.x/initials/svg?backgroundColor=${AVATAR_BACKGROUND_COLOR}&seed=${encodeURIComponent(fullname)}`;
};

export const resolveAvatarUrl = <T extends AvatarUser & { avatarUrl?: string | null }>(
    user: T,
) => user.avatarUrl ?? buildDefaultAvatarUrl(user);

export const withResolvedAvatar = <
    T extends AvatarUser & { avatarUrl?: string | null },
>(
    user: T,
) => ({ ...user, avatarUrl: resolveAvatarUrl(user) });
