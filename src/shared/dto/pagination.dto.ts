import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1, { message: 'Page is invalid' })
  @IsOptional()
  page = 1;

  @ApiProperty({
    required: false,
    example: 50,
    type: Number,
  })
  @IsInt()
  @Min(1, { message: 'Size is invalid' })
  @Type(() => Number)
  @IsOptional()
  size = 50;
}
