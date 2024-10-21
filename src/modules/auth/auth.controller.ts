import type { WalletSignatureResponseDto } from './dto/add-wallet-response.dto';
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import { AddWalletDto, GetWalletSignatureDto } from 'src/modules/auth/dto/add-wallet-request.dto';
import type { GetUserProfileResponseDto } from 'src/modules/auth/dto/get-user-profile-response.dto';
import { EmailDto, LoginRequestDto, VerifyEmailDto } from 'src/modules/auth/dto/login-request.dto';
import type { LoginResponseDto } from 'src/modules/auth/dto/login-response.dto';
import type { LogoutResponseDto } from 'src/modules/auth/dto/logout-response.dto';
import { RecoverPasswordDto } from 'src/modules/auth/dto/recover-password.dto';
import { RefreshTokenRequestDto } from 'src/modules/auth/dto/refresh-token-request.dto';
import type { RefreshTokenResponseDto } from 'src/modules/auth/dto/refresh-token-response.dto';
import { RegisterRequestDto } from 'src/modules/auth/dto/register-request.dto';
import type { RegisterResponseDto } from 'src/modules/auth/dto/register-response.dto';
import type {
  ForgotPasswordResponseDto,
  RecoverPassword,
  ResendVerifyEmailResponseDto,
} from 'src/modules/auth/dto/send-verify-email-response.dto';
import { JwtDecodedData, Public } from 'src/shared/decorators/auth.decorator';
import { JwtPayload } from 'src/shared/dto/jwt-payload.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginRequestDto);
  }

  @Get('me')
  async profile(@JwtDecodedData() data: JwtPayload): Promise<GetUserProfileResponseDto> {
    return this.authService.getProfile(data.userId);
  }

  @Get('verify')
  verify(@JwtDecodedData() data: JwtPayload): JwtPayload {
    return data;
  }

  @Post('resend-email')
  @Public()
  async resendEmail(@Body() emailDto: EmailDto): Promise<ResendVerifyEmailResponseDto> {
    const resendVerifyEmail = await this.authService.resendEmail(emailDto.email);

    return {
      resendVerifyEmail,
    };
  }

  @Get('verify-email')
  @Public()
  async verifyEmail(@Query() query: VerifyEmailDto): Promise<string> {
    return this.authService.verifyEmail(query);
  }

  @Post('request-forgot-password')
  @Public()
  async forgotPassword(@Body() emailDto: EmailDto): Promise<ForgotPasswordResponseDto> {
    const forgotPassword = await this.authService.forgotPassword(emailDto.email);

    return {
      forgotPassword,
    };
  }

  @Post('recover-password')
  @Public()
  async RecoverPassword(@Body() body: RecoverPasswordDto): Promise<RecoverPassword> {
    const recoverPassword = await this.authService.recoverPassword(body);

    return {
      recoverPassword,
    };
  }

  @Post('register')
  @Public()
  async register(@Body() registerRequestDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerRequestDto);
  }

  @Post('refresh-token')
  @Public()
  refreshToken(
    @Req() req: Request,
    @Body() refreshTokenRequestDto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenRequestDto.refreshToken);
  }

  @Post('logout')
  async logout(@JwtDecodedData() data: JwtPayload): Promise<LogoutResponseDto> {
    const logoutResult = await this.authService.logout(data.userId);

    return {
      logoutResult,
    };
  }

  @Get('sign-message')
  async getSignature(
    @JwtDecodedData() data: JwtPayload,
    @Query() query: GetWalletSignatureDto,
  ): Promise<WalletSignatureResponseDto> {
    const signMessage = await this.authService.getSignature(data.userId, query.address);

    return { signMessage };
  }

  @Post('add-wallet')
  async addWallet(@JwtDecodedData() data: JwtPayload, @Body() body: AddWalletDto): Promise<boolean> {
    return this.authService.addWallet(data.userId, body);
  }
}
