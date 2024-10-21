import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsEqualsTo, IsPassword } from 'src/shared/decorators/validator.decorator';

export class RecoverPasswordDto {
  @ApiProperty({
    required: true,
    example: '',
  })
  @IsString()
  @MinLength(6)
  token: string;

  @ApiProperty({
    required: true,
    example: 'Abcd@1234',
  })
  @IsNotEmpty({ message: 'Password is required!' })
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
