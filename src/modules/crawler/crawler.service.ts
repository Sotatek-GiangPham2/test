/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { COMMON_CONSTANT, NATIVE_TOKEN_DECIMAL } from 'src/constants/common.constant';
import { EEventType, ESystemSetting, ETransactionStatus, EWebhookEvent } from 'src/constants/enum.constant';
import { PAYMENT } from 'src/contracts/payment';
import { DepositEventEntity } from 'src/entities/deposit-event.entity';
import { LatestBlockEntity } from 'src/entities/latest-block.entity';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';
import { UserEntity } from 'src/entities/user.entity';
import { WithdrawEventEntity } from 'src/entities/withdraw-event.entity';
import { MailService } from 'src/modules/mail/mail.service';
import { WebhookService } from 'src/modules/webhook/webhook.service';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { DatabaseUtilService } from 'src/shared/services/database.service';
import { sleep } from 'src/shared/utils/sleep';
import type { QueryRunner } from 'typeorm';
import { DataSource, Repository } from 'typeorm';
import Web3 from 'web3';

@Injectable()
export class CrawlerService {
  private readonly web3Instance: Web3;

  public static DELAY_TIME_CRAWL_MS = 5000; //5s

  public static DELAY_TIME_DELETE_PENDING_USER = 3600000; //1h;

  constructor(
    private readonly configService: ApiConfigService,
    private readonly webhookService: WebhookService,
    @InjectRepository(LatestBlockEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly latestBlockRepository: Repository<LatestBlockEntity>,
    @InjectRepository(SystemSettingEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly systemSettingRepository: Repository<SystemSettingEntity>,
    private readonly databaseUtilService: DatabaseUtilService,
    private readonly emailService: MailService,
    @InjectDataSource(COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly datasource: DataSource,
  ) {
    this.web3Instance = new Web3(this.configService.getEnv('SEPOLIA_RPC'));
  }

  public async start() {
    while (true) {
      try {
        const latestBlockDatabase = await this.latestBlockRepository.findOne({
          where: {
            service: 'payment',
          },
        });

        let latestBlock = Number(this.configService.getEnv('START_BLOCK'));

        if (!latestBlockDatabase) {
          await this.latestBlockRepository.insert({
            latestBlock,
            service: 'payment',
          });
        } else {
          latestBlock = Number(latestBlockDatabase.latestBlock);
        }

        const from = latestBlock + 1;
        const latestBlockOnChain = await this.web3Instance.eth.getBlockNumber();
        const safeBlock = Number(latestBlockOnChain) - Number(this.configService.getEnv('BLOCK_CONFIRMATION'));

        if (safeBlock < from) {
          return [];
        }

        const to = from + 1000 < safeBlock ? from + 1000 : safeBlock;
        console.info('crawler from, to block (1):', from, to);
        await this.crawlData(from, to);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }

      await sleep(CrawlerService.DELAY_TIME_CRAWL_MS);
    }
  }

  async crawlData(from: number, to: number) {
    const contract = new this.web3Instance.eth.Contract(PAYMENT.ABI, PAYMENT.Address);
    // eslint-disable-next-line
    const eventLogs: any = await contract.getPastEvents('allEvents', {
      fromBlock: from,
      toBlock: to,
    });

    await this.latestBlockRepository.upsert({ latestBlock: to, service: 'payment' }, ['service']);
    await this.databaseUtilService.executeTransaction(this.datasource, async (queryRunner: QueryRunner) => {
      for (const event of eventLogs) {
        switch (event.event) {
          case EEventType.DEPOSIT: {
            await this.handleDepositEvent(event, queryRunner);
            break;
          }

          case EEventType.WITHDRAW: {
            await this.handleWithdrawEvent(event, queryRunner);
            break;
          }

          case EEventType.BURN_RATE_CHANGE: {
            const systemSettings = await this.systemSettingRepository.findOne({
              where: {
                isActive: Number(true),
                service: ESystemSetting.BURN_RATE_CHANGE,
              },
            });

            if (systemSettings) {
              systemSettings.value = String(BigNumber(event.returnValues.newBurnRate).dividedBy(100).toNumber());

              await this.systemSettingRepository.save(systemSettings);
            }

            break;
          }

          case EEventType.STAKING_RATE_CHANGE: {
            const systemSettings = await this.systemSettingRepository.findOne({
              where: {
                isActive: Number(true),
                service: ESystemSetting.STAKING_RATE_CHANGE,
              },
            });

            if (systemSettings) {
              systemSettings.value = String(BigNumber(event.returnValues.newStakingRate).dividedBy(100).toNumber());

              await this.systemSettingRepository.save(systemSettings);
            }

            break;
          }

          case EEventType.STAKING_WALLET_CHANGE: {
            const systemSettings = await this.systemSettingRepository.findOne({
              where: {
                isActive: Number(true),
                service: ESystemSetting.STAKING_WALLET_CHANGE,
              },
            });

            if (systemSettings) {
              systemSettings.value = event.returnValues.newStakingWallet;

              await this.systemSettingRepository.save(systemSettings);
            }

            break;
          }

          case EEventType.SET_PAUSE: {
            await this.systemSettingRepository.upsert(
              { value: event.returnValues.paused, service: ESystemSetting.SET_PAUSE },
              ['service'],
            );

            break;
          }

          case EEventType.MAXIMUM_WITHDRAWAL_CHANGE: {
            const newAmount = BigNumber(event.returnValues.newMaximumWithdraw)
              .dividedBy(NATIVE_TOKEN_DECIMAL)
              .toNumber();

            await this.systemSettingRepository.upsert(
              { value: String(newAmount), service: ESystemSetting.MAXIMUM_WITHDRAWAL_CHANGE },
              ['service'],
            );

            break;
          }

          case EEventType.MINIMUM_WITHDRAWAL_CHANGE: {
            const newAmount = BigNumber(event.returnValues.newMinimumWithdraw)
              .dividedBy(NATIVE_TOKEN_DECIMAL)
              .toNumber();

            await this.systemSettingRepository.upsert(
              { value: String(newAmount), service: ESystemSetting.MINIMUM_WITHDRAWAL_CHANGE },
              ['service'],
            );

            break;
          }

          case EEventType.FEE_WALLET_CHANGE: {
            await this.systemSettingRepository.upsert(
              {
                value: String(event.returnValues.newFeeWallet),
                service: ESystemSetting.FEE_WALLET_CHANGE,
              },
              ['service'],
            );

            break;
          }

          case EEventType.FEE_RATE_CHANGE: {
            await this.systemSettingRepository.upsert(
              {
                value: String(BigNumber(event.returnValues.newFeeRate).dividedBy(100).toNumber()),
                service: ESystemSetting.FEE_RATE_CHANGE,
              },
              ['service'],
            );

            break;
          }

          default:
            console.error(`Event not found ${event.event}`);
        }
      }
    });
  }

  // eslint-disable-next-line
  private async handleDepositEvent(event: any, queryRunner: QueryRunner) {
    const block = await this.web3Instance.eth.getBlock(event.blockNumber);

    const user = await queryRunner.manager.findOne(UserEntity, {
      where: {
        walletAddress: event.returnValues.from,
      },
    });

    const transferAmount = BigNumber(event.returnValues.transferAmount);
    const burnAmount = BigNumber(event.returnValues.burnAmount);
    const stakingAmount = BigNumber(event.returnValues.stakingAmount);
    const amount = BigNumber(event.returnValues.amount);
    const amountReceived = amount.dividedBy(NATIVE_TOKEN_DECIMAL).toNumber();

    if (user) {
      const userAfterUpdate = await queryRunner.manager.query(
        'update "user" set balance = balance + $1 where id = $2 RETURNING balance',
        [Number(amountReceived), user.id],
      );
      // send email to user
      await this.emailService.sendDepositEventEmail(user.email, {
        to: user.email,
        amount: amountReceived,
        withdrawAddress: user.walletAddress,
        email: user.email,
        txHash: event.transactionHash,
        balance: userAfterUpdate[0][0].balance,
      });
    }

    const depositEvent: Partial<DepositEventEntity> = {
      txHash: event.transactionHash,
      fromAddress: event.returnValues.from,
      status: ETransactionStatus.SUCCESS,
      amount: amount.dividedBy(NATIVE_TOKEN_DECIMAL).toNumber(),
      transferAmount: transferAmount.dividedBy(NATIVE_TOKEN_DECIMAL).toNumber(),
      burnAmount: burnAmount.dividedBy(NATIVE_TOKEN_DECIMAL).toNumber(),
      stakingAmount: stakingAmount.dividedBy(NATIVE_TOKEN_DECIMAL).toNumber(),
      blockTimestamp: new Date(Number(block.timestamp) * 1000),
      userId: user?.id,
    };

    await queryRunner.manager.save(DepositEventEntity, depositEvent);
    await this.webhookService.publishEvent(EWebhookEvent.DEPOSIT, depositEvent);
  }

  // eslint-disable-next-line
  private async handleWithdrawEvent(event: any, queryRunner: QueryRunner) {
    const txHash = event.transactionHash;
    const { to, transferAmount, withdrawRequestId, feeAmount } = event.returnValues;

    const transferAmountBN = BigNumber(transferAmount);
    const amount = transferAmountBN.dividedBy(NATIVE_TOKEN_DECIMAL).toString();

    const withdrawEvent = await queryRunner.manager.findOne(WithdrawEventEntity, {
      where: {
        id: withdrawRequestId,
      },
    });

    if (!withdrawEvent) {
      await queryRunner.manager.save(WithdrawEventEntity, [
        {
          transferAmount: amount,
          creditAmount: transferAmountBN.toString(),
          amount,
          feeAmount: BigNumber(feeAmount).dividedBy(NATIVE_TOKEN_DECIMAL).toString(),
          to,
          txHash,
          status: ETransactionStatus.FAILED,
          id: withdrawRequestId,
          withdrawRequestTimestamp: Math.floor(Date.now() / 1000 + 1200),
        },
      ]);
    } else {
      await queryRunner.manager.update(WithdrawEventEntity, withdrawEvent.id, {
        txHash,
        status: ETransactionStatus.SUCCESS,
        transferAmount: amount,
        feeAmount: BigNumber(feeAmount).dividedBy(NATIVE_TOKEN_DECIMAL).toString(),
      });

      const user = await queryRunner.manager.findOne(UserEntity, {
        where: {
          id: withdrawEvent.userId,
        },
      });

      if (user && user.email) {
        // send email to user
        await this.emailService.sendWithdrawEventEmail(user.email, {
          to: user.email,
          amount: Number(amount).toFixed(2),
          withdrawAddress: withdrawEvent.to,
          email: user.email,
          txHash,
        });
      }

      await this.webhookService.publishEvent(EWebhookEvent.WITHDRAW, withdrawEvent);
    }
  }
}
