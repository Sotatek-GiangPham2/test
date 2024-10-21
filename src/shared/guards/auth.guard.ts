import { RedisService } from '@liaoliaots/nestjs-redis';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Redis } from 'ioredis';
import { CACHE_CONSTANT } from 'src/constants/cache.constant';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { ERROR } from 'src/constants/exception.constant';
import { IS_PUBLIC } from 'src/shared/decorators/auth.decorator';
import type { JwtPayload } from 'src/shared/dto/jwt-payload.dto';
import { BaseException } from 'src/shared/filters/exception.filter';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private redisInstance: Redis;

  constructor(private jwtService: JwtService, private reflector: Reflector, private redisService: RedisService) {
    this.redisInstance = this.redisService.getClient(COMMON_CONSTANT.REDIS_DEFAULT_NAMESPACE);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);

      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();

      const token = this.extractTokenFromHeader(request);

      const currentUrl = request.url;

      if (!token) {
        throw new BaseException(ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      const signature = token.split('.')[2];

      const isExistSignature = currentUrl.includes('admin')
        ? await this.redisInstance.get(`${CACHE_CONSTANT.ACCESS_TOKEN_ADMIN_PREFIX}${payload.userId}`)
        : await this.redisInstance.get(`${CACHE_CONSTANT.ACCESS_TOKEN_PREFIX}${payload.userId}`);

      if (!isExistSignature) {
        throw new BaseException(ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }

      if (signature !== isExistSignature) {
        throw new BaseException(ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }

      request[COMMON_CONSTANT.JWT_DECODED_REQUEST_PARAM] = payload;

      return true;
    } catch (error) {
      console.error(error);

      throw new BaseException(ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
  }
}
