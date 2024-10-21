/* eslint-disable no-await-in-loop */
import { SystemSettingService } from '../system-setting/system-setting.service';
import type { DepositHistoryRequestDto } from './dto/deposit-history-request.dto';
import type { TotalDepositResponseDto } from './dto/total-deposit-response.dto';
import type { TotalWithdrawResponseDto } from './dto/total-withdraw-response.dto';
import type { WithdrawHistoryRequestDto } from './dto/withdraw-history-request.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { COMMON_CONSTANT, NATIVE_TOKEN_DECIMAL } from 'src/constants/common.constant';
import { PAYMENT_CONTRACT_EIP712 } from 'src/constants/contract.constant';
import { ETransactionStatus } from 'src/constants/enum.constant';
import { ERROR } from 'src/constants/exception.constant';
import { PAYMENT } from 'src/contracts/payment';
import { DepositEventEntity } from 'src/entities/deposit-event.entity';
import { UserEntity } from 'src/entities/user.entity';
import { WithdrawEventEntity } from 'src/entities/withdraw-event.entity';
import type { CreateWithdrawResponseDto } from 'src/modules/transaction/dto/create-withdraw-response';
import { BaseException } from 'src/shared/filters/exception.filter';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { DatabaseUtilService } from 'src/shared/services/database.service';
import type { QueryRunner } from 'typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type { Contract } from 'web3';
import { Web3 } from 'web3';

@Injectable()
export class TransactionService {
  private readonly web3Instance: Web3;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private PaymentContract: Contract<any> = undefined;

  constructor(
    @InjectRepository(UserEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DepositEventEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly depositEventRepository: Repository<DepositEventEntity>,
    @InjectRepository(WithdrawEventEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly withdrawEventRepository: Repository<WithdrawEventEntity>,
    private readonly apiConfigService: ApiConfigService,
    private readonly systemSettingService: SystemSettingService,
    @InjectDataSource(COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly datasource: DataSource,
    private readonly databaseUtilService: DatabaseUtilService,
  ) {
    this.web3Instance = new Web3(this.apiConfigService.getEnv('SEPOLIA_RPC'));
    this.PaymentContract = new this.web3Instance.eth.Contract(PAYMENT.ABI, PAYMENT.Address);
  }

  async createWithdrawRequest(userId: number, to: string, amount: number): Promise<CreateWithdrawResponseDto> {
    if (amount <= 0) {
      throw new BaseException(ERROR.MINIMUM_WITHDRAWAL_MUST_GREATER_THAN_ZERO);
    }

    const minimumAmount = await this.systemSettingService.minWithdrawAmount();

    if (amount < minimumAmount) {
      throw new BaseException(
        ERROR.WITHDRAWAL_AMOUNT_EXCEED(`Withdrawal amount must be greater than ${minimumAmount}`),
      );
    }

    const maximumAmount = await this.systemSettingService.maxWithdrawAmount();

    if (amount > maximumAmount) {
      throw new BaseException(
        ERROR.WITHDRAWAL_AMOUNT_EXCEED(`Withdrawal amount must be smaller than ${maximumAmount}`),
      );
    }

    const userExist = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!userExist) {
      throw new BaseException(ERROR.USER_NOT_EXIST);
    }

    const checkPausedContract = await this.systemSettingService.setPause();

    if (checkPausedContract) {
      throw new BaseException(ERROR.CONTRACT_PAUSED);
    }

    const amountBN = BigNumber(amount).multipliedBy(NATIVE_TOKEN_DECIMAL).toFixed(0);

    const result: Promise<CreateWithdrawResponseDto> = this.databaseUtilService.executeTransaction(
      this.datasource,
      async (queryRunner: QueryRunner) => {
        const user = await queryRunner.manager.findOne(UserEntity, {
          where: {
            id: userId,
          },
        });

        if (Number(user.balance) < amount) {
          throw new BaseException(ERROR.NOT_ENOUGH_WITHDRAW_BALANCE);
        }

        let count = 0;
        let withdrawRequest;

        const withdrawRequestTimestamp = Math.floor(Date.now() / 1000 + 1200);

        while (true) {
          count++;
          withdrawRequest = await queryRunner.manager.save(WithdrawEventEntity, {
            userId,
            to,
            creditAmount: amountBN,
            transferAmount: '0',
            amount: amount.toString(),
            withdrawRequestTimestamp,
            signature: null,
            from: user.walletAddress,
            status: ETransactionStatus.PENDING,
          });

          const checkWithdrawRequestId: boolean = await this.PaymentContract.methods
            .withdrawRequestStatus(withdrawRequest.id)
            .call();
          console.info('checkWithdrawRequestId', checkWithdrawRequestId);

          if (!checkWithdrawRequestId) {
            break;
          }

          if (count > 5) {
            throw new BaseException(ERROR.CREATE_WITHDRAW_REQUEST_FAIL);
          }
        }

        // create signature
        const wallet = new ethers.Wallet(this.apiConfigService.getEnv('SIGNER_PRIVATE_KEY'));

        let signature = '';

        try {
          signature = await wallet.signTypedData(
            PAYMENT_CONTRACT_EIP712.WITHDRAW_DOMAIN,
            {
              WithdrawSignature: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'withdrawRequestId', type: 'uint256' },
                { name: 'withdrawRequestTimestamp', type: 'uint256' },
              ],
            },
            {
              to,
              amount: amountBN,
              withdrawRequestId: withdrawRequest.id,
              withdrawRequestTimestamp,
            },
          );
        } catch (error) {
          console.info(error);

          throw new InternalServerErrorException('internal server error');
        }

        // update balance
        await queryRunner.manager.query('update "user" set balance = balance - $1 where id = $2', [
          Number(amount),
          user.id,
        ]);

        await queryRunner.manager.update(WithdrawEventEntity, { id: withdrawRequest.id }, { signature });

        return {
          signature,
          to,
          amount: amountBN,
          withdrawRequestId: withdrawRequest.id,
          withdrawRequestTimestamp,
        };
      },
    );

    const withdraw_resulst = await result;

    return withdraw_resulst;
  }

  async withdrawHistories(query: WithdrawHistoryRequestDto, userId?: number) {
    let whereCondition = {};

    if (userId) {
      try {
        const userExist = await this.userRepository.exists({
          where: {
            id: userId,
          },
        });

        if (!userExist) {
          throw new BaseException(ERROR.USER_NOT_EXIST);
        }

        whereCondition = {
          ...whereCondition,
          userId,
        };
      } catch (error) {
        if (error instanceof BaseException) {
          throw error;
        }

        throw new BaseException(ERROR.INVALID_INPUT_PARAMS);
      }
    }

    if (query.status) {
      whereCondition = {
        ...whereCondition,
        status: query.status,
      };
    }

    const withdrawTransactions: Array<WithdrawEventEntity & { email?: string }> =
      await this.withdrawEventRepository.find({
        where: whereCondition,
        skip: (query.page - 1) * query.size,
        take: query.size,
        order: {
          id: 'DESC',
        },
      });

    let userIds = withdrawTransactions.map((e) => e.userId);
    userIds = userIds.filter((e) => e);

    // get email user
    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });

    for (const withdrawTransaction of withdrawTransactions) {
      const findUser = users.find((e) => withdrawTransaction.userId === e.id);

      if (findUser) {
        withdrawTransaction.email = findUser.email;
      }
    }

    const countWithdrawTransactions = await this.withdrawEventRepository.count({
      where: whereCondition,
    });

    const returnValue = {
      withdrawTransactions,
      pagination: {
        size: query.size,
        page: query.page,
        total: countWithdrawTransactions,
        totalPage: Math.ceil(countWithdrawTransactions / query.size),
      },
    };

    return returnValue;
  }

  async depositHistory(query: DepositHistoryRequestDto, userId?: number) {
    let whereCondition = {};

    if (userId) {
      try {
        const userExist = await this.userRepository.exists({
          where: {
            id: userId,
          },
        });

        if (!userExist) {
          console.info('user not exist', userId);
          console.info('user not exist', userExist);

          throw new BaseException(ERROR.USER_NOT_EXIST);
        }
      } catch (error) {
        if (error instanceof BaseException) {
          throw error;
        }

        throw new BaseException(ERROR.INVALID_INPUT_PARAMS);
      }

      whereCondition = {
        ...whereCondition,
        userId,
      };
    }

    const depositTransactions: Array<DepositEventEntity & { email?: string }> = await this.depositEventRepository.find({
      where: whereCondition,
      skip: (query.page - 1) * query.size,
      take: query.size,
      order: {
        id: 'DESC',
      },
    });

    let userIds = depositTransactions.map((e) => e.userId);
    userIds = userIds.filter((e) => e);

    // get email user
    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });

    for (const depositTransaction of depositTransactions) {
      const findUser = users.find((e) => depositTransaction.userId === e.id);

      if (findUser) {
        depositTransaction.email = findUser.email;
      }
    }

    const countDepositTransactions = await this.depositEventRepository.count({
      where: whereCondition,
    });

    const returnValue = {
      depositTransactions,
      pagination: {
        size: query.size,
        page: query.page,
        total: countDepositTransactions,
        totalPage: Math.ceil(countDepositTransactions / query.size),
      },
    };

    return returnValue;
  }

  async totalDeposit(): Promise<TotalDepositResponseDto> {
    const totalDeposit = await this.depositEventRepository
      .createQueryBuilder('depositEvent')
      .select([
        'SUM(depositEvent.amount) as amount',
        'SUM(depositEvent.transferAmount) as transfer',
        'SUM(depositEvent.burnAmount) as burn',
        'SUM(depositEvent.stakingAmount) as staking',
      ])
      .where('depositEvent.status = :status', { status: ETransactionStatus.SUCCESS })
      .getRawOne();

    return {
      amount: totalDeposit.amount ? Number(totalDeposit.amount) : 0,
      transferAmount: totalDeposit.transfer ? Number(totalDeposit.transfer) : 0,
      burnAmount: totalDeposit.burn ? Number(totalDeposit.burn) : 0,
      stakingAmount: totalDeposit.staking ? Number(totalDeposit.staking) : 0,
    };
  }

  async totalWithdraw(): Promise<TotalWithdrawResponseDto> {
    const totalWithdraw = await this.withdrawEventRepository
      .createQueryBuilder('withdraw')
      .select([
        'SUM(withdraw.amount) as amount',
        'SUM(withdraw.transferAmount) as transfer',
        'SUM(withdraw.feeAmount) as fee',
      ])
      .where('withdraw.status = :status', { status: ETransactionStatus.SUCCESS })
      .getRawOne();

    return {
      amount: totalWithdraw.amount ? Number(totalWithdraw.amount) : 0,
      transferAmount: totalWithdraw.transfer ? Number(totalWithdraw.transfer) : 0,
      feeAmount: totalWithdraw.fee ? Number(totalWithdraw.fee) : 0,
    };
  }
}
