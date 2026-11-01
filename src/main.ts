import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'AV Manager API',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
