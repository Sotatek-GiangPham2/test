import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { ethers } from 'ethers';
import type { Redis } from 'ioredis';
import { CACHE_CONSTANT } from 'src/constants/cache.constant';
import { ADMIN_ROLE, COMMON_CONSTANT } from 'src/constants/common.constant';
import { EEmailType, ERole, EUserStatus } from 'src/constants/enum.constant';
import { ERROR } from 'src/constants/exception.constant';
import { AdminEntity } from 'src/entities/admin.entity';
import { UserEntity } from 'src/entities/user.entity';
import type { AddWalletDto } from 'src/modules/auth/dto/add-wallet-request.dto';
import type { GetUserProfileResponseDto } from 'src/modules/auth/dto/get-user-profile-response.dto';
import type { LoginRequestDto, VerifyEmailDto } from 'src/modules/auth/dto/login-request.dto';
import type { LoginResponseDto } from 'src/modules/auth/dto/login-response.dto';
import type { RecoverPasswordDto } from 'src/modules/auth/dto/recover-password.dto';
import type { RefreshTokenResponseDto } from 'src/modules/auth/dto/refresh-token-response.dto';
import type { RegisterRequestDto } from 'src/modules/auth/dto/register-request.dto';
import type { RegisterResponseDto } from 'src/modules/auth/dto/register-response.dto';
import { MailService } from 'src/modules/mail/mail.service';
import type { JwtDecodedData, JwtPayload } from 'src/shared/dto/jwt-payload.dto';
import { BaseException } from 'src/shared/filters/exception.filter';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { Not, Repository } from 'typeorm';
import Web3 from 'web3';

@Injectable()
export class AuthService {
  private redisInstance: Redis;

  private readonly web3Instance: Web3;

  constructor(
    @InjectRepository(UserEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity, COMMON_CONSTANT.DATASOURCE.DEFAULT)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly apiConfigService: ApiConfigService,
    private mailService: MailService,
  ) {
    this.redisInstance = this.redisService.getClient(COMMON_CONSTANT.REDIS_DEFAULT_NAMESPACE);
    this.web3Instance = new Web3(this.apiConfigService.getEnv('SEPOLIA_RPC'));
  }

  generateAccessToken(payload: JwtPayload): string {
    const accessToken = this.jwtService.sign(payload);
    const signatureAccessToken = accessToken.split('.')[2];

    const prefix =
      payload.role === ADMIN_ROLE ? CACHE_CONSTANT.ACCESS_TOKEN_ADMIN_PREFIX : CACHE_CONSTANT.ACCESS_TOKEN_PREFIX;
    // set access token
    this.redisInstance.set(`${prefix}${payload.userId}`, signatureAccessToken);
    this.redisInstance.expire(
      `${prefix}${payload.userId}`,
      this.apiConfigService.getEnv('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    );

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload): string {
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
    });
    const signatureRefreshToken = refreshToken.split('.')[2];

    const prefix =
      payload.role === ADMIN_ROLE ? CACHE_CONSTANT.REFRESH_TOKEN_ADMIN_PREFIX : CACHE_CONSTANT.REFRESH_TOKEN_PREFIX;
    // set refresh token
    this.redisInstance.set(`${prefix}${payload.userId}`, signatureRefreshToken);
    this.redisInstance.expire(
      `${prefix}${payload.userId}`,
      this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );

    return refreshToken;
  }

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginRequestDto.email,
      },
    });

    if (!user) {
      throw new BaseException(ERROR.USER_NOT_EXIST);
    }

    if (user.status === EUserStatus.PENDING) {
      throw new BaseException(ERROR.USER_NOT_ACTIVE);
    }

    const match = await compare(loginRequestDto.password, user.password);

    if (!match) {
      throw new BaseException(ERROR.WRONG_USERNAME_OR_PASSWORD);
    }

    const accessToken = this.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async loginAdmin(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const admin = await this.adminRepository.findOne({
      where: {
        email: loginRequestDto.email,
      },
    });

    if (!admin) {
      throw new BaseException(ERROR.ADMIN_NOT_EXIST);
    }

    const match = await compare(loginRequestDto.password, admin.password);

    if (!match) {
      throw new BaseException(ERROR.WRONG_USERNAME_OR_PASSWORD);
    }

    const accessToken = this.generateAccessToken({
      userId: admin.id,
      role: ADMIN_ROLE,
    });

    const refreshToken = this.generateRefreshToken({
      userId: admin.id,
      role: ADMIN_ROLE,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: number): Promise<GetUserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      walletAddress: user.walletAddress,
      balance: user.balance,
    };
  }

  async getAdminProfile(userId: number): Promise<AdminEntity> {
    return this.adminRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async register(registerRequestDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const checkUserExist = await this.userRepository.findOne({
      where: {
        email: registerRequestDto.email,
      },
    });

    if (checkUserExist) {
      throw new BaseException(ERROR.USER_EXISTED);
    }

    const hashPassword = await hash(registerRequestDto.password, COMMON_CONSTANT.BCRYPT_SALT_ROUND);
    const userCreated: UserEntity = await this.userRepository.save({
      email: registerRequestDto.email,
      password: hashPassword,
      status: EUserStatus.PENDING,
      role: ERole.OWNER,
    });
    // sent mail verify account
    await this.sentEmail(userCreated, EEmailType.VERIFY_EMAIL);

    return {
      id: userCreated.id,
      email: userCreated.email,
    };
  }

  private async sentEmail(user: UserEntity, emailType: EEmailType): Promise<boolean> {
    const token = this.jwtService.sign(
      {
        email: user.email,
        id: user.id,
      },
      {
        expiresIn: this.apiConfigService.getEnv('JWT_EMAIL_EXPIRATION_TIME') + 's', //'3m',
        secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
      },
    );

    const signature = token.split('.')[2];

    this.redisInstance.set(`${CACHE_CONSTANT.SESSION_EMAIL_PREFIX}${user.id}`, signature);
    this.redisInstance.expire(
      `${CACHE_CONSTANT.SESSION_EMAIL_PREFIX}${user.id}`,
      this.apiConfigService.getEnv('JWT_EMAIL_EXPIRATION_TIME'),
    );

    switch (emailType) {
      case EEmailType.VERIFY_EMAIL:
        await this.mailService.verifyEmail(user.email, {
          name: user?.username ?? '',
          email: user.email,
          link: `${this.apiConfigService.getEnv('BE_URL')}api/auth/verify-email?token=${token}`,
          token,
        });
        break;
      case EEmailType.RESET_PASSWORD:
        await this.mailService.resetPassword(user.email, {
          name: user?.username ?? '',
          email: user.email,
          link: `${this.apiConfigService.getEnv('BE_URL')}api/auth/recover-password?token=${token}`,
          token,
        });
        break;

      default:
        break;
    }

    return true;
  }

  async resendEmail(email: string): Promise<boolean> {
    const checkUserExist = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!checkUserExist) {
      throw new BaseException(ERROR.USER_NOT_EXIST);
    }

    if (checkUserExist.status === EUserStatus.ACTIVE) {
      throw new BaseException(ERROR.USER_ALREADY_ACTIVE);
    }

    const result = await this.sentEmail(checkUserExist, EEmailType.VERIFY_EMAIL);

    return Boolean(result);
  }

  async verifyEmail(query: VerifyEmailDto): Promise<string> {
    let jwtData: JwtDecodedData;

    try {
      jwtData = this.jwtService.verify(query.token, {
        secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new BaseException(ERROR.INVALID_VERIFY_TOKEN);
    }

    const checkToken = await this.redisInstance.get(`${CACHE_CONSTANT.SESSION_EMAIL_PREFIX}${jwtData.id}`);

    if (!checkToken) {
      throw new BaseException(ERROR.INVALID_VERIFY_TOKEN);
    }

    const signature = query.token.split('.')[2];

    if (checkToken !== signature) {
      throw new BaseException(ERROR.INVALID_VERIFY_TOKEN);
    }

    const user = await this.userRepository.findOne({
      where: {
        email: jwtData.email,
      },
    });

    await this.redisInstance.del(`${CACHE_CONSTANT.SESSION_EMAIL_PREFIX}${jwtData.id}`);

    await this.userRepository.update(
      {
        id: user.id,
      },
      {
        status: EUserStatus.ACTIVE,
      },
    );

    return 'success';
  }

  async forgotPassword(email: string): Promise<boolean> {
    const checkUserExist = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!checkUserExist) {
      throw new BaseException(ERROR.USER_NOT_EXIST);
    }

    if (checkUserExist.status !== EUserStatus.ACTIVE) {
      throw new BaseException(ERROR.USER_NOT_ACTIVE);
    }

    return this.sentEmail(checkUserExist, EEmailType.RESET_PASSWORD);
  }

  async recoverPassword(body: RecoverPasswordDto, role?: string): Promise<boolean> {
    let jwtData: JwtDecodedData;

    try {
      jwtData = this.jwtService.verify(body.token, {
        secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new BaseException(ERROR.INVALID_VERIFY_TOKEN);
    }

    const prefix =
      role === ADMIN_ROLE ? CACHE_CONSTANT.SESSION_EMAIL_ADMIN_PREFIX : CACHE_CONSTANT.SESSION_EMAIL_PREFIX;

    const checkToken = await this.redisInstance.get(`${prefix}${jwtData.id}`);

    const signature = body.token.split('.')[2];

    if (!checkToken || checkToken !== signature) {
      throw new BaseException(ERROR.INVALID_VERIFY_TOKEN);
    }

    const useRepository = role !== ADMIN_ROLE ? this.userRepository : this.adminRepository;
    const user = await useRepository.findOne({
      where: {
        email: jwtData.email,
      },
    });

    const match = await compare(body.password, user.password);

    if (match) {
      throw new BaseException(ERROR.NEW_PASSWORD_DIFFIRENT_WITH_OLD_PASSWORD);
    }

    await this.redisInstance.del(`${prefix}${jwtData.id}`);

    const hashPassword = await hash(body.password, COMMON_CONSTANT.BCRYPT_SALT_ROUND);
    await useRepository.update(
      {
        id: user.id,
      },
      {
        password: hashPassword,
      },
    );

    return true;
  }

  async logout(userId: number): Promise<boolean> {
    const logoutResult = await this.redisInstance.del(`${CACHE_CONSTANT.ACCESS_TOKEN_PREFIX}${userId}`);
    const refreshTokenResult = await this.redisInstance.del(`${CACHE_CONSTANT.REFRESH_TOKEN_PREFIX}${userId}`);

    return Boolean(logoutResult && refreshTokenResult);
  }

  async refreshToken(refreshToken: string, role?: string): Promise<RefreshTokenResponseDto> {
    const signatureRefreshToken = refreshToken.split('.')[2];

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        payload = this.jwtService.decode(refreshToken);

        throw new BaseException(ERROR.REFRESH_TOKEN_EXPIRED);
      } else {
        throw new BaseException(ERROR.REFRESH_TOKEN_FAIL);
      }
    }

    const prefix =
      role && role === ADMIN_ROLE ? CACHE_CONSTANT.REFRESH_TOKEN_ADMIN_PREFIX : CACHE_CONSTANT.REFRESH_TOKEN_PREFIX;
    const signatureRefreshTokenCache = await this.redisInstance.get(`${prefix}${payload.userId}`);

    if (!signatureRefreshTokenCache || signatureRefreshTokenCache !== signatureRefreshToken) {
      throw new BaseException(ERROR.REFRESH_TOKEN_EXPIRED);
    }

    const newAccessToken = this.generateAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    const newRefreshToken = this.generateRefreshToken({
      userId: payload.userId,
      role: payload.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getSignature(userId: number, address: string): Promise<string> {
    const time = Date.now();
    const message = `sign message with address: ${address}, at: ${time}`;
    this.redisInstance.set(`${CACHE_CONSTANT.USER_SIGNATURE_MESSAGE_PREFIX}${userId}`, message);
    this.redisInstance.expire(
      `${CACHE_CONSTANT.USER_SIGNATURE_MESSAGE_PREFIX}${userId}`,
      this.apiConfigService.getEnv('USER_SIGNATURE_MESSAGE_TIME'),
    );

    return message;
  }

  async addWallet(userId: number, body: AddWalletDto): Promise<boolean> {
    let addr: string;

    try {
      const message = await this.redisInstance.get(`${CACHE_CONSTANT.USER_SIGNATURE_MESSAGE_PREFIX}${userId}`);
      addr = ethers.verifyMessage(message, body.signature);
    } catch {
      throw new BaseException(ERROR.VERIFY_SIGNATURE_FAILED);
    }

    if (addr.toLowerCase() !== body.address.toLowerCase()) {
      throw new BaseException(ERROR.VERIFY_SIGNATURE_FAILED);
    }

    const checkWalletExist = await this.userRepository.findOne({
      where: {
        walletAddress: addr,
        id: Not(userId),
      },
    });

    if (checkWalletExist) {
      throw new BaseException(ERROR.WALLET_EXIST);
    }

    try {
      await this.userRepository.update(
        {
          id: userId,
        },
        {
          walletAddress: addr,
        },
      );
      await this.redisInstance.del(`${CACHE_CONSTANT.USER_SIGNATURE_MESSAGE_PREFIX}${userId}`);

      return true;
    } catch {
      return false;
    }
  }

  async adminForgotPassword(email: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({
      where: {
        email,
      },
    });

    if (!admin) {
      throw new BaseException(ERROR.ADMIN_NOT_EXIST);
    }

    const token = this.jwtService.sign(
      {
        email: admin.email,
        id: admin.id,
        role: ADMIN_ROLE,
      },
      {
        expiresIn: this.apiConfigService.getEnv('JWT_EMAIL_EXPIRATION_TIME') + 's', //'3m',
        secret: this.apiConfigService.getEnv('JWT_REFRESH_TOKEN_SECRET'),
      },
    );

    const signature = token.split('.')[2];

    this.redisInstance.set(`${CACHE_CONSTANT.SESSION_EMAIL_ADMIN_PREFIX}${admin.id}`, signature);
    this.redisInstance.expire(
      `${CACHE_CONSTANT.SESSION_EMAIL_ADMIN_PREFIX}${admin.id}`,
      this.apiConfigService.getEnv('JWT_EMAIL_EXPIRATION_TIME'),
    );

    await this.mailService.resetPassword(admin.email, {
      name: '',
      email: admin.email,
      link: `${this.apiConfigService.getEnv('BE_URL')}api//admin/auth/recover-password?token=${token}`,
      token,
    });

    return true;
  }
}
