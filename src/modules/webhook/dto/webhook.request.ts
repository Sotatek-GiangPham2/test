import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsValidUrl } from 'src/shared/decorators/validator.decorator';

export class AddWebhookDto {
  @ApiProperty({
    required: true,
    example: 'web-1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
    example: 'http://localhost:8000/',
  })
  @IsValidUrl()
  @IsString()
  url: string;
}
