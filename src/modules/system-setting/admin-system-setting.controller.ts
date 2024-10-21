import type {
  BurnRateResponse,
  FeeRateResponse,
  FeeWalletResponse,
  MaxWithdrawAmountResponse,
  MinWithdrawAmountResponse,
  SetPausedResponse,
  StakingRateResponse,
  StakingWalletResponse,
} from './dto/system-setting-response.dto';
import { SystemSettingService } from './system-setting.service';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin/system-setting')
@ApiTags('Admin System Setting')
@ApiBearerAuth()
export class AdminSystemSettingController {
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

  @Get('pause-contract')
  async pausedContract(): Promise<SetPausedResponse> {
    const setPaused = await this.systemSettingService.setPause();

    return {
      setPaused,
    };
  }

  @Get('fee-wallet')
  async feeWallet(): Promise<FeeWalletResponse> {
    const feeWallet = await this.systemSettingService.feeWallet();

    return { feeWallet };
  }

  @Get('fee-rate')
  async feeRate(): Promise<FeeRateResponse> {
    const feeRate = await this.systemSettingService.feeRate();

    return { feeRate };
  }

  @Get('burn-rate')
  async burnRate(): Promise<BurnRateResponse> {
    const burnRate = await this.systemSettingService.burnRate();

    return { burnRate };
  }

  @Get('staking-rate')
  async stakingRate(): Promise<StakingRateResponse> {
    const stakingRate = await this.systemSettingService.stakingRate();

    return { stakingRate };
  }

  @Get('staking-wallet')
  async stakingWallet(): Promise<StakingWalletResponse> {
    const stakingWallet = await this.systemSettingService.stakingWallet();

    return { stakingWallet };
  }
}
