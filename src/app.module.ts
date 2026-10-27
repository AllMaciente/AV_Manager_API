import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CircuitosModule } from './circuitos/circuitos.module';

@Module({
  imports: [DbModule, UsersModule, AuthModule, PermissionsModule, CircuitosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
