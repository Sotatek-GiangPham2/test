import { DepositHistoryRequestDto } from './dto/deposit-history-request.dto';
import type { TotalDepositResponseDto } from './dto/total-deposit-response.dto';
import type { TotalWithdrawResponseDto } from './dto/total-withdraw-response.dto';
import { WithdrawHistoryRequestDto } from './dto/withdraw-history-request.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionService } from 'src/modules/transaction/transaction.service';

@Controller('admin/transactions')
@ApiTags('Admin Transactions')
@ApiBearerAuth()
export class AdminTransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('withdraw-history')
  withdrawHistories(@Query() query: WithdrawHistoryRequestDto) {
    return this.transactionService.withdrawHistories(query);
  }

  @Get('deposit-history')
  depositHistory(@Query() query: DepositHistoryRequestDto) {
    return this.transactionService.depositHistory(query);
  }

  @Get('total-deposit')
  totalDeposit(): Promise<TotalDepositResponseDto> {
    return this.transactionService.totalDeposit();
  }

  @Get('total-withdraw')
  totalWithdraw(): Promise<TotalWithdrawResponseDto> {
    return this.transactionService.totalWithdraw();
  }
}
