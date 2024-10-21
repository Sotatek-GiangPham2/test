import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ERROR } from 'src/constants/exception.constant';

export class BaseException extends HttpException {
  // eslint-disable-next-line
  constructor(response: string | Record<string, any>, status?: number) {
    super(response, status || HttpStatus.BAD_REQUEST);
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    error: {
      response: { message: string; code: number };
      status: number;
      message: string;
      name: string;
    },
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.getStatusCode(error);
    const responsePayload = this.buildResponsePayload(error);

    response.status(status).json(responsePayload);
  }

  private getStatusCode(error: { status: number; response: { code: number } }): number {
    const code = error.response?.code;

    return !error.status || code === -1 ? HttpStatus.INTERNAL_SERVER_ERROR : error.status;
  }

  private buildResponsePayload(error: { response: { message: string; code: number } }): {
    code: number;
    message: string;
    data: null;
  } {
    const code = error.response?.code || ERROR.UNKNOWN_ERROR.code;
    const message = error.response?.message || ERROR.UNKNOWN_ERROR.message;

    return {
      code,
      message,
      data: null,
    };
  }
}
