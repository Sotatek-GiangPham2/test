import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateIf, isNotEmpty } from 'class-validator';
import { ETransactionStatus } from 'src/constants/enum.constant';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

export class WithdrawHistoryRequestDto extends PaginationDto {
  @ApiProperty({
    enum: ETransactionStatus,
    required: false,
  })
  @IsEnum(ETransactionStatus)
  @IsOptional()
  @ValidateIf((_object, value) => isNotEmpty(value))
  status: ETransactionStatus;
}
