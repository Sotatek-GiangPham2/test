import { DepositHistoryRequestDto } from './dto/deposit-history-request.dto';
import { WithdrawHistoryRequestDto } from './dto/withdraw-history-request.dto';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateWithdrawRequestDto } from 'src/modules/transaction/dto/create-withdraw-request';
import type { CreateWithdrawResponseDto } from 'src/modules/transaction/dto/create-withdraw-response';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { JwtDecodedData } from 'src/shared/decorators/auth.decorator';
import { JwtPayload } from 'src/shared/dto/jwt-payload.dto';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('withdraw-request')
  createWithdrawRequest(
    @JwtDecodedData() data: JwtPayload,
    @Body() body: CreateWithdrawRequestDto,
  ): Promise<CreateWithdrawResponseDto> {
    return this.transactionService.createWithdrawRequest(data.userId, body.to, body.amount);
  }

  @Get('withdraw-history')
  withdrawHistory(@JwtDecodedData() data: JwtPayload, @Query() query: WithdrawHistoryRequestDto) {
    return this.transactionService.withdrawHistories(query, data.userId);
  }

  @Get('deposit-history')
  depositHistory(@JwtDecodedData() data: JwtPayload, @Query() query: DepositHistoryRequestDto) {
    return this.transactionService.depositHistory(query, data.userId);
  }
}
