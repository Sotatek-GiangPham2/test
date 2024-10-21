import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';
import { IsValidAddr } from 'src/shared/decorators/validator.decorator';

export class CreateWithdrawRequestDto {
  @ApiProperty({
    required: true,
    example: '0xa47bc1aF9E4b2ee22FF23D506251F4f0592eB8D0',
  })
  @IsString({ message: 'Wallet address must be a string' })
  @IsValidAddr()
  to: string;

  @ApiProperty({
    required: true,
    description: 'Credit amount',
  })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 8 }, { message: 'Enter a maximum of 8 decimal places.' })
  amount: number;
}
