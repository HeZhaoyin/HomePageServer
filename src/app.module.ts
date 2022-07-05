import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthService } from './logical/auth/auth.service';
import { AuthModule } from './logical/auth/auth.module';
import { UserController } from './logical/user/user.controller';
import { UserModule } from './logical/user/user.module';

@Module({
  controllers: [AppController, UserController],
  providers: [AppService],
  imports: [AuthModule, UserModule],
})
export class AppModule {}
