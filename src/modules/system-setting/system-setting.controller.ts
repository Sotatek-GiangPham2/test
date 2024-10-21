import type { MaxWithdrawAmountResponse, MinWithdrawAmountResponse } from './dto/system-setting-response.dto';
import { SystemSettingService } from './system-setting.service';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('system-setting')
@ApiTags('System Setting')
@ApiBearerAuth()
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @Get('min-withdraw-amount')
  async minWithdrawAmount(): Promise<MinWithdrawAmountResponse> {
    const minimumWithdrawal = await this.systemSettingService.minWithdrawAmount();

    return {
      minimumWithdrawal,
    };
  }

  @Get('max-withdraw-amount')
  async maxWithdrawAmount(): Promise<MaxWithdrawAmountResponse> {
    const maximumWithdrawal = await this.systemSettingService.maxWithdrawAmount();

    return {
      maximumWithdrawal,
    };
  }
}
