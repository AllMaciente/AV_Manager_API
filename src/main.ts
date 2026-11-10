import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const db = app.get<DB>(DRIZZLE);
  await migrate(db, { migrationsFolder: resolveMigrationsFolder() });

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

  const documentFactory = () => SwaggerModule.createDocument(app, config, {
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

  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({ origin: origins, credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
