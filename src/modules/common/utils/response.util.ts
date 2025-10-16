export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode?: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  errors?: any[];
}

export class ResponseUtil {
  static success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
    return {
      status: 'success',
      statusCode: 200,
      data,
      message,
      meta,
    };
  }

  static error(message: string, statusCode?: number, errors?: any[]): ApiResponse {
    return {
      status: 'error',
      statusCode,
      message,
      errors,
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ): ApiResponse<T[]> {
    return {
      status: 'success',
      statusCode: 200,
      data,
      message,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Helper methods for common error scenarios
  static notFound(message: string = 'Resource not found'): ApiResponse {
    return this.error(message, 404);
  }

  static badRequest(message: string, errors?: any[]): ApiResponse {
    return this.error(message, 400, errors);
  }

  static conflict(message: string): ApiResponse {
    return this.error(message, 409);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponse {
    return this.error(message, 403);
  }

  static validationError(message: string, errors?: any[]): ApiResponse {
    return this.error(message, 422, errors);
  }
}
