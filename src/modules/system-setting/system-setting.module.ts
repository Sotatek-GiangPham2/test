import { AdminSystemSettingController } from './admin-system-setting.controller';
import { SystemSettingController } from './system-setting.controller';
import { SystemSettingService } from './system-setting.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';

const entites = [SystemSettingEntity];

@Module({
  imports: [TypeOrmModule.forFeature(entites, COMMON_CONSTANT.DATASOURCE.DEFAULT)],
  controllers: [SystemSettingController, AdminSystemSettingController],
  providers: [SystemSettingService],
})
export class SystemSettingModule {}
