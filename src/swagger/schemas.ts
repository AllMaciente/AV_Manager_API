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

export const permissionCatalogSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      category: { type: 'string', example: 'circuito' },
      permissions: {
        type: 'array',
        items: { type: 'string' },
        example: ['circuito.create', 'circuito.edit'],
      },
    },
    required: ['category', 'permissions'],
  },
};

const equipamentoProperties: Record<string, SchemaObject> = {
  id: { type: 'string', example: 'Aw_M6jP36B8F' },
  name: { type: 'string', example: 'Mesa de Som' },
};

export const equipamentoResponseSchema: SchemaObject = {
  type: 'object',
  properties: equipamentoProperties,
  required: ['id', 'name'],
};

export const equipamentoListSchema: SchemaObject = {
  type: 'array',
  items: equipamentoResponseSchema,
};

export const equipamentoBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      example: 'Mesa de Som',
    },
  },
  required: ['name'],
};

export const equipamentoUserSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...userSummaryProperties,
    ordem: { type: 'integer', example: 1 },
    sabeOperar: { type: 'boolean', example: true },
  },
  required: ['id', 'username', 'firstName', 'lastName', 'ordem', 'sabeOperar'],
};

export const equipamentoUserListSchema: SchemaObject = {
  type: 'array',
  items: equipamentoUserSchema,
};

export const userEquipamentoSchema: SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'Aw_M6jP36B8F' },
    name: { type: 'string', example: 'Mesa de Som' },
    ordem: { type: 'integer', example: 1 },
    sabeOperar: { type: 'boolean', example: true },
  },
  required: ['id', 'name', 'ordem', 'sabeOperar'],
};

export const userEquipamentoListSchema: SchemaObject = {
  type: 'array',
  items: userEquipamentoSchema,
};

export const userEquipamentoLinkSchema: SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'V1StGXR8_Z5j' },
    userId: { type: 'string', example: 'V1StGXR8_Z5j' },
    equipamentoId: { type: 'string', example: 'Aw_M6jP36B8F' },
    ordem: { type: 'integer', example: 1 },
    sabeOperar: { type: 'boolean', example: true },
  },
  required: ['id', 'userId', 'equipamentoId', 'ordem', 'sabeOperar'],
};

export const setEquipamentoOrderBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    equipamentoIds: {
      type: 'array',
      items: { type: 'string', minLength: 12, maxLength: 12 },
      example: ['Aw_M6jP36B8F', 'V1StGXR8_Z5j'],
      description: 'IDs dos equipamentos na ordem desejada',
    },
    removerAusentes: {
      type: 'boolean',
      default: true,
      example: true,
      description:
        'Remove os equipamentos do usuário que não estiverem na lista (padrão true)',
    },
  },
  required: ['equipamentoIds'],
};

const eventSummaryProperties: Record<string, SchemaObject> = {
  id: { type: 'string', example: 'V1StGXR8_Z5j' },
  name: { type: 'string', example: 'Culto de Domingo' },
  description: {
    type: 'string',
    nullable: true,
    example: 'Culto dominical da manhã',
  },
};

export const eventSummarySchema: SchemaObject = {
  type: 'object',
  properties: eventSummaryProperties,
  required: ['id', 'name'],
};

export const eventDayResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    date: { type: 'string', format: 'date', example: '2026-11-01' },
    description: {
      type: 'string',
      nullable: true,
      example: 'Domingo pela manhã',
    },
  },
  required: ['eventId', 'date'],
};

export const eventCircuitWithCircuitSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    circuitId: { type: 'string', example: 'Aw_M6jP36B8F' },
    circuit: circuitoResponseSchema,
  },
  required: ['eventId', 'circuitId'],
};

export const eventCircuitWithEventSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    circuitId: { type: 'string', example: 'Aw_M6jP36B8F' },
    event: eventSummarySchema,
  },
  required: ['eventId', 'circuitId'],
};

export const eventCircuitResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    circuitId: { type: 'string', example: 'Aw_M6jP36B8F' },
    event: eventSummarySchema,
    circuit: circuitoResponseSchema,
  },
  required: ['eventId', 'circuitId'],
};

export const eventCircuitLinkSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    circuitId: { type: 'string', example: 'Aw_M6jP36B8F' },
  },
  required: ['eventId', 'circuitId'],
};

export const eventResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...eventSummaryProperties,
    eventCircuits: {
      type: 'array',
      items: eventCircuitWithCircuitSchema,
    },
    days: {
      type: 'array',
      items: eventDayResponseSchema,
    },
  },
  required: ['id', 'name'],
};

export const eventListResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    items: { type: 'array', items: eventResponseSchema },
    total: { type: 'integer', example: 42 },
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    totalPages: { type: 'integer', example: 3 },
  },
  required: ['items', 'total', 'page', 'limit', 'totalPages'],
};

export const eventBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      example: 'Culto de Domingo',
    },
    description: {
      type: 'string',
      nullable: true,
      example: 'Culto dominical da manhã',
      description: 'Opcional',
    },
    circuitoId: {
      type: 'array',
      items: { type: 'string', minLength: 12, maxLength: 12 },
      example: ['Aw_M6jP36B8F'],
      description: 'IDs dos circuitos vinculados ao evento (opcional)',
    },
  },
  required: ['name'],
};

export const eventCircuitBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    circuitId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'Aw_M6jP36B8F',
      description: 'ID do circuito que será vinculado ao evento',
    },
  },
  required: ['circuitId'],
};

export const rosterResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'V1StGXR8_Z5j' },
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    date: { type: 'string', format: 'date', example: '2026-11-01' },
    period: {
      type: 'string',
      enum: ['MORNING', 'AFTERNOON'],
      example: 'MORNING',
    },
    equipamentoId: { type: 'string', example: 'Aw_M6jP36B8F' },
    userId: { type: 'string', example: 'V1StGXR8_Z5j' },
    eventDay: eventDayResponseSchema,
    equipamento: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'Aw_M6jP36B8F' },
        name: { type: 'string', example: 'Mesa de Som' },
      },
      required: ['id', 'name'],
    },
    user: userSummarySchema,
  },
  required: ['id', 'eventId', 'date', 'period', 'equipamentoId', 'userId'],
};

export const eventDayWithRostersSchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: { type: 'string', example: 'V1StGXR8_Z5j' },
    date: { type: 'string', format: 'date', example: '2026-11-01' },
    description: {
      type: 'string',
      nullable: true,
      example: 'Domingo pela manhã',
    },
    rosters: {
      type: 'array',
      items: rosterResponseSchema,
    },
  },
  required: ['eventId', 'date'],
};

export const eventDayListSchema: SchemaObject = {
  type: 'array',
  items: eventDayWithRostersSchema,
};

export const eventDayBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      format: 'date',
      example: '2026-11-01',
    },
    description: {
      type: 'string',
      nullable: true,
      example: 'Domingo pela manhã',
      description: 'Opcional',
    },
  },
  required: ['date'],
};

export const eventDayBatchBodySchema: SchemaObject = {
  type: 'array',
  minItems: 1,
  items: eventDayBodySchema,
};

export const eventDayUpdateBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      nullable: true,
      example: 'Domingo pela manhã',
      description: 'Opcional',
    },
  },
};

export const rosterListResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    items: { type: 'array', items: rosterResponseSchema },
    total: { type: 'integer', example: 42 },
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    totalPages: { type: 'integer', example: 3 },
  },
  required: ['items', 'total', 'page', 'limit', 'totalPages'],
};

export const rosterBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'V1StGXR8_Z5j',
    },
    date: {
      type: 'string',
      format: 'date',
      example: '2026-11-01',
    },
    period: {
      type: 'string',
      enum: ['MORNING', 'AFTERNOON'],
      example: 'MORNING',
    },
    equipamentoId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'Aw_M6jP36B8F',
    },
    userId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'V1StGXR8_Z5j',
    },
  },
  required: ['eventId', 'date', 'period', 'equipamentoId', 'userId'],
};

export const rosterUpdateBodySchema: SchemaObject = {
  type: 'object',
  properties: {
    eventId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'V1StGXR8_Z5j',
    },
    date: {
      type: 'string',
      format: 'date',
      example: '2026-11-01',
    },
    period: {
      type: 'string',
      enum: ['MORNING', 'AFTERNOON'],
      example: 'AFTERNOON',
    },
    equipamentoId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'Aw_M6jP36B8F',
    },
    userId: {
      type: 'string',
      minLength: 12,
      maxLength: 12,
      example: 'V1StGXR8_Z5j',
    },
  },
  description: 'Informe ao menos um campo',
};
