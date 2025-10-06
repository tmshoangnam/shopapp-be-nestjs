import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `🚀 ${method} ${url} - ${ip} - ${userAgent}`,
      'HTTP Request',
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const { statusCode } = response;

          this.logger.log(
            `✅ ${method} ${url} - ${statusCode} - ${responseTime}ms`,
            'HTTP Response',
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `❌ ${method} ${url} - ${statusCode} - ${responseTime}ms - ${error.message}`,
            error.stack,
            'HTTP Error',
          );
        },
      }),
    );
  }
}
