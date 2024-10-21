import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsEqualsTo, IsPassword } from 'src/shared/decorators/validator.decorator';

export class RegisterRequestDto {
  @ApiProperty({
    required: true,
    example: 'user@gmail.com',
  })
  @MinLength(6)
  @MaxLength(254)
  @Transform(({ value }) => value.toString().toLowerCase())
  @IsEmail({ ignore_max_length: true })
  email: string;

  @ApiProperty({
    required: true,
    example: 'Abcd@1234',
  })
  @IsPassword()
  password: string;

  @ApiProperty({
    required: true,
    example: 'Abcd@1234',
  })
  @IsNotEmpty({ message: 'confirmPassword is required!' })
  @IsEqualsTo('password')
  confirmPassword: string;
}
