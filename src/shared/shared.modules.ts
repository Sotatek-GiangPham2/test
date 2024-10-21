import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { DatabaseUtilService } from 'src/shared/services/database.service';

const providers = [ApiConfigService, DatabaseUtilService];

const jwtModule = JwtModule.registerAsync({
  inject: [ApiConfigService],
  useFactory: (configService: ApiConfigService) => configService.getJwtConfig(),
});

@Global()
@Module({
  providers,
  imports: [HttpModule, jwtModule],
  exports: [...providers, HttpModule, jwtModule],
})
export class SharedModule {}
