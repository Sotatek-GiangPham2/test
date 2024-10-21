import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    required: true,
    example: 'user@gmail.com',
  })
  @MinLength(6)
  @IsEmail({ ignore_max_length: true })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;

  @ApiProperty({
    required: true,
    example: 'Abcd@1234',
  })
  @MinLength(8)
  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @Expose()
  @ApiProperty({ example: 'YSHAbRdHIoR3MmoAchqwzFKprJ' })
  @IsString({ message: 'token must be a string' })
  @IsNotEmpty()
  token: string;
}

export class EmailDto {
  @ApiProperty({
    required: true,
    example: 'user@gmail.com',
  })
  @MinLength(6)
  @IsEmail({ ignore_max_length: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toString().toLowerCase();
    }
  })
  email: string;
}
