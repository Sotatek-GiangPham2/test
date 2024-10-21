import { AdminAuthController } from './admin-auth.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { AdminEntity } from 'src/entities/admin.entity';
import { UserEntity } from 'src/entities/user.entity';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { MailModule } from 'src/modules/mail/mail.module';

const entites = [UserEntity, AdminEntity];

@Module({
  imports: [TypeOrmModule.forFeature(entites, COMMON_CONSTANT.DATASOURCE.DEFAULT), MailModule],
  controllers: [AuthController, AdminAuthController],
  providers: [AuthService],
})
export class AuthModule {}
