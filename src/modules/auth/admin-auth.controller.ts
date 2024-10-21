import { AuthService } from './auth.service';
import { EmailDto, LoginRequestDto } from './dto/login-request.dto';
import type { LoginResponseDto } from './dto/login-response.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import type { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import type { ForgotPasswordResponseDto, RecoverPassword } from './dto/send-verify-email-response.dto';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ADMIN_ROLE } from 'src/constants/common.constant';
import type { AdminEntity } from 'src/entities/admin.entity';
import { JwtDecodedData, Public } from 'src/shared/decorators/auth.decorator';
import { JwtPayload } from 'src/shared/dto/jwt-payload.dto';

@Controller('admin/auth')
@ApiTags('Admin Auth')
@ApiBearerAuth()
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.loginAdmin(loginRequestDto);
  }

  @Get('me')
  async profile(@JwtDecodedData() data: JwtPayload): Promise<AdminEntity> {
    return this.authService.getAdminProfile(data.userId);
  }

  @Post('refresh-token')
  @Public()
  refreshToken(
    @Req() req: Request,
    @Body() refreshTokenRequestDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenRequestDto.refreshToken, ADMIN_ROLE);
  }

  @Post('request-forgot-password')
  @Public()
  async forgotPassword(@Body() emailDto: EmailDto): Promise<ForgotPasswordResponseDto> {
    const forgotPassword = await this.authService.adminForgotPassword(emailDto.email);

    return {
      forgotPassword,
    };
  }

  @Post('recover-password')
  @Public()
  async RecoverPassword(@Body() body: RecoverPasswordDto): Promise<RecoverPassword> {
    const recoverPassword = await this.authService.recoverPassword(body, ADMIN_ROLE);

    return {
      recoverPassword,
    };
  }
}
