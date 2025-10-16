import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseUtil } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Pass through already formatted ApiResponse
        if (data && data.status && (data.status === 'success' || data.status === 'error')) {
          return data;
        }

        // Paginated response normalization
        if (data && data.data && data.meta && typeof data.meta.total === 'number') {
          return ResponseUtil.paginated(data.data, data.meta.total, data.meta.page, data.meta.limit);
        }

        return ResponseUtil.success(data);
      }),
    );
  }
}

