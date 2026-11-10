export const PERMISSIONS = {
  users: ['view', 'create', 'edit', 'editPassword', 'setPerm', 'viewPerm'],
  circuito: ['create', 'edit'],
  equipamentos: ['create', 'edit', 'setOrder'],
  event: ['create', 'edit'],
  roster: ['create', 'edit'],
} as const;

type Groups = typeof PERMISSIONS;

export type Permission = {
  [G in keyof Groups]: `${G & string}.${Groups[G][number]}`;
}[keyof Groups];

export const allPermissions: Permission[] = Object.entries(PERMISSIONS).flatMap(
  ([group, names]) => names.map((n) => `${group}.${n}` as Permission),
);
