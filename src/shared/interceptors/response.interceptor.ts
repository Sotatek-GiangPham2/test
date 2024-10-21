import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { COMMON_CONSTANT } from 'src/constants/common.constant';
import { RESPONSE_MESSAGE } from 'src/shared/decorators/response.decorator';

export interface ResponseFormat<T> {
  code: number;
  message: string;
  data: T;
}
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data) {
          const responsePayload = {
            code: COMMON_CONSTANT.RESPONSE_SUCCESS.CODE,
            message:
              this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
              COMMON_CONSTANT.RESPONSE_SUCCESS.MESSAGE,
            data: data.data || data,
          };

          return responsePayload;
        }
      }),
    );
  }
}
