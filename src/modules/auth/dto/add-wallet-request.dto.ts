import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsValidAddr } from 'src/shared/decorators/validator.decorator';

export class GetWalletSignatureDto {
  @ApiProperty({
    required: true,
    example: '0xa47bc1aF9E4b2ee22FF23D506251F4f0592eB8D0',
  })
  @IsString()
  @IsValidAddr()
  address: string;
}

export class AddWalletDto {
  @ApiProperty({
    required: true,
    example: '0xa47bc1aF9E4b2ee22FF23D506251F4f0592eB8D0',
  })
  @IsValidAddr()
  @IsString()
  address: string;

  @ApiProperty({
    required: true,
    example: '0x55fb7a9b008c2dd8825438a7079a6d7e5719f9029c7c68e74491724ac1fb1c',
  })
  @IsString()
  signature: string;
}
