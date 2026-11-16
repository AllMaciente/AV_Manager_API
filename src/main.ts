import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { DRIZZLE } from './db/db.module';
import type { DB } from './db/db.module';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { join } from 'path';
import { existsSync } from 'fs';

function resolveMigrationsFolder(): string {
  const candidates = [
    join(__dirname, '..', 'drizzle'),
    join(process.cwd(), 'drizzle'),
    join(process.cwd(), 'dist', 'drizzle'),
  ];

  const folder = candidates.find((candidate) => existsSync(candidate));
  if (!folder) {
    throw new Error(
      'Pasta de migrations não encontrada. Execute o build (npm run build) antes de iniciar.',
    );
  }

  return folder;
}

function readEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function parseCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Falha rápido no boot em vez de subir com configuração insegura.
 * Em produção o segredo do JWT precisa ser forte e diferente da senha do banco.
 */
function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = readEnv('DATABASE_URL');
  const jwtSecret = readEnv('JWT_SECRET');

  if (isProduction && jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET deve ter pelo menos 32 caracteres em produção.',
    );
  }

  if (isProduction) {
    let databasePassword = '';
    try {
      databasePassword = new URL(databaseUrl).password;
    } catch {
      // A validação do formato da URL fica a cargo do driver do banco.
    }

    if (databasePassword && databasePassword === jwtSecret) {
      throw new Error(
        'JWT_SECRET não pode ser igual à senha do banco de dados.',
      );
    }

    const origins = parseCorsOrigins();
    if (!origins.length) {
      throw new Error(
        'CORS_ORIGINS deve listar as origens permitidas em produção.',
      );
    }
    if (origins.includes('*')) {
      throw new Error('CORS_ORIGINS não pode usar "*" em produção.');
    }
  }
}

function configureSecurityHeaders(app: INestApplication): void {
  const server = app.getHttpAdapter().getInstance() as {
    disable?: (name: string) => void;
    set?: (name: string, value: unknown) => void;
  };

  server.disable?.('x-powered-by');

  // Necessário para rate limit/HTTPS corretos quando há um proxy reverso.
  const trustProxy = process.env.TRUST_PROXY?.trim();
  if (trustProxy && server.set) {
    server.set('trust proxy', trustProxy === 'true' ? 1 : trustProxy);
  }

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    );

    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    next();
  });
}

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  configureSecurityHeaders(app);

  const db = app.get<DB>(DRIZZLE);
  await migrate(db, { migrationsFolder: resolveMigrationsFolder() });

  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('AV Manager API')
      .setDescription(
        'API de gerenciamento de equipes de áudio e vídeo: autenticação, circuitos, usuários, permissões, equipamentos, eventos e escalas.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'Status da API')
      .addTag('auth', 'Autenticação e cadastro')
      .addTag('circuitos', 'Gerenciamento de circuitos')
      .addTag('users', 'Usuários e permissões')
      .addTag('permissions', 'Catálogo de permissões')
      .addTag('equipamentos', 'Equipamentos e ordem por usuário')
      .addTag('event', 'Eventos, dias e circuitos vinculados')
      .addTag('roster', 'Escalas de eventos')
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) => {
          const cleanController = controllerKey.replace('Controller', '');
          return `${cleanController}_${methodKey}`;
        },
      });

    SwaggerModule.setup('api', app, documentFactory, {
      customSiteTitle: 'AV Manager API',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const origins = parseCorsOrigins();

  app.enableCors({
    origin: origins.length ? origins : false,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  });

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
