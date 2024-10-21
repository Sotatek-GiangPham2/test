/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { ESystemSetting } from 'src/constants/enum.constant';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { Repository } from 'typeorm';

@Injectable()
export class SystemSettingService {
  constructor(
    @InjectRepository(SystemSettingEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly systemSettingRepository: Repository<SystemSettingEntity>,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  async minWithdrawAmount(): Promise<number> {
    const minimumAmount = await this.getConfig(ESystemSetting.MINIMUM_WITHDRAWAL_CHANGE, 'MINIMUM_WITHDRAWAL');

    return Number(minimumAmount);
  }

  async maxWithdrawAmount(): Promise<number> {
    const maximumAmount = await this.getConfig(ESystemSetting.MAXIMUM_WITHDRAWAL_CHANGE, 'MAXIMUM_WITHDRAWAL');

    return Number(maximumAmount);
  }

  async setPause(): Promise<boolean> {
    const pause = await this.getConfig(ESystemSetting.SET_PAUSE, 'SET_PAUSE');

    return pause === '1' ? true : false;
  }

  async feeWallet(): Promise<string> {
    return this.getConfig(ESystemSetting.FEE_WALLET_CHANGE, 'FEE_WALLET');
  }

  async feeRate(): Promise<number> {
    const feeRate = await this.getConfig(ESystemSetting.FEE_RATE_CHANGE, 'FEE_RATE');

    return Number(feeRate);
  }

  async burnRate(): Promise<number> {
    const burnRate = await this.getConfig(ESystemSetting.BURN_RATE_CHANGE, 'BURN_RATE');

    return Number(burnRate);
  }

  async stakingWallet(): Promise<string> {
    return this.getConfig(ESystemSetting.STAKING_WALLET_CHANGE, 'STAKING_WALLET');
  }

  async stakingRate(): Promise<number> {
    const stakingRate = await this.getConfig(ESystemSetting.STAKING_RATE_CHANGE, 'STAKING_RATE');

    return Number(stakingRate);
  }

  private async getConfig(settingType: ESystemSetting, envParam: string): Promise<string> {
    const config = await this.systemSettingRepository.findOne({
      where: {
        service: settingType,
      },
    });

    return config ? config.value : this.apiConfigService.getEnv(envParam);
  }
}
