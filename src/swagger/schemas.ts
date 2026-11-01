import type { SchemaObject } from '@nestjs/swagger';

export const errorSchema: SchemaObject = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', example: 400 },
    message: {
      oneOf: [
        { type: 'string', example: 'Credenciais inválidas' },
        {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              campo: { type: 'string', example: 'email' },
              erro: { type: 'string', example: 'Invalid email' },
            },
            required: ['campo', 'erro'],
          },
        },
      ],
    },
    error: { type: 'string', example: 'Bad Request' },
  },
  required: ['statusCode', 'message'],
};

const userSummaryProperties: Record<string, SchemaObject> = {
  id: { type: 'string', example: 'V1StGXR8_Z5j' },
  username: { type: 'string', example: 'joao' },
  firstName: { type: 'string', example: 'João' },
  middleName: { type: 'string', nullable: true, example: 'da' },
  lastName: { type: 'string', example: 'Silva' },
  email: {
    type: 'string',
    format: 'email',
    nullable: true,
    example: 'joao@example.com',
  },
};

export const userSummarySchema: SchemaObject = {
  type: 'object',
  properties: userSummaryProperties,
  required: ['id', 'username', 'firstName', 'lastName'],
};

export const userProfileSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...userSummaryProperties,
    emailVerifiedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      example: null,
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-10-26T12:00:00.000Z',
    },
    isAdmin: { type: 'boolean', example: false },
    circuitoId: { type: 'string', nullable: true, example: 'abc123' },
  },
  required: ['id', 'username', 'firstName', 'lastName', 'createdAt', 'isAdmin'],
};

export const userListItemSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...userSummaryProperties,
    isAdmin: { type: 'boolean', example: false },
    circuitoId: { type: 'string', nullable: true, example: 'Aw_M6jP36B8F' },
    circuitoName: { type: 'string', nullable: true, example: 'SC-004' },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-10-26T12:00:00.000Z',
    },
  },
  required: [
    'id',
    'username',
    'firstName',
    'lastName',
    'isAdmin',
    'circuitoId',
    'createdAt',
  ],
};

export const userListResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    items: { type: 'array', items: userListItemSchema },
    total: { type: 'integer', example: 42 },
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    totalPages: { type: 'integer', example: 3 },
  },
  required: ['items', 'total', 'page', 'limit', 'totalPages'],
};

export const authUserSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...userSummaryProperties,
    isAdmin: { type: 'boolean', example: false },
    circuitoId: { type: 'string', nullable: true, example: null },
  },
  required: [
    'id',
    'username',
    'firstName',
    'lastName',
    'isAdmin',
    'circuitoId',
  ],
};

export const registerBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 50, example: 'joao' },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      example: 'João',
    },
    middleName: {
      type: 'string',
      maxLength: 50,
      nullable: true,
      example: 'da',
      description: 'Opcional',
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      example: 'Silva',
    },
    email: {
      type: 'string',
      format: 'email',
      nullable: true,
      example: 'joao@example.com',
      description: 'Opcional',
    },
    circuitoId: {
      type: 'string',
      nullable: true,
      maxLength: 12,
      example: 'Aw_M6jP36B8F',
      description: 'Circuito do usuário (opcional)',
    },
    password: {
      type: 'string',
      format: 'password',
      minLength: 8,
      maxLength: 128,
      example: 'senha12345',
    },
  },
  required: ['username', 'firstName', 'lastName', 'password'],
};

export const loginBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    username: { type: 'string', example: 'joao' },
    password: {
      type: 'string',
      format: 'password',
      example: 'senha12345',
    },
  },
  required: ['username', 'password'],
};

export const registerResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    user: authUserSchema,
    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
  },
  required: ['user', 'accessToken'],
};

export const loginResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
  },
  required: ['accessToken'],
};

const circuitoProperties: Record<string, SchemaObject> = {
  id: { type: 'string', example: 'Aw_M6jP36B8F' },
  name: { type: 'string', example: 'SC-004' },
};

export const circuitoBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      example: 'SC-004',
    },
  },
  required: ['name'],
};

export const circuitoResponseSchema: SchemaObject = {
  type: 'object',
  properties: circuitoProperties,
  required: ['id', 'name'],
};

export const circuitoListSchema: SchemaObject = {
  type: 'array',
  items: circuitoResponseSchema,
};

export const circuitoUserListSchema: SchemaObject = {
  type: 'array',
  items: userSummarySchema,
};

export const assignedUserSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...userSummaryProperties,
    circuitoId: { type: 'string', nullable: true, example: 'Aw_M6jP36B8F' },
  },
  required: ['id', 'username', 'firstName', 'lastName', 'circuitoId'],
};

export const permissionsViewSchema: SchemaObject = {
  type: 'object',
  properties: {
    userId: { type: 'string', example: 'V1StGXR8_Z5j' },
    isAdmin: { type: 'boolean', example: false },
    permissions: {
      type: 'array',
      items: { type: 'string' },
      example: ['circuito.create', 'users.view'],
    },
  },
  required: ['userId', 'isAdmin', 'permissions'],
};

export const setPermissionsBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    permissions: {
      type: 'array',
      items: { type: 'string' },
      example: ['circuito.create', 'users.view'],
      description: 'Lista completa de permissões do usuário',
    },
  },
  required: ['permissions'],
};

export const patternQueryDescription =
  'Filtro por chave exata ou com curinga. Ex.: circuito.edit, circuito.*, users.*, *';
