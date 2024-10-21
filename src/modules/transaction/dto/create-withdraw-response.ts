import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateWithdrawResponseDto {
  @ApiProperty()
  signature: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  tokenOut: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  withdrawRequestId: number;

  @ApiProperty()
  @IsNumber()
  withdrawRequestTimestamp: number;
}
