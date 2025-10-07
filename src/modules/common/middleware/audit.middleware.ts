import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../audit/audit.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Audit Middleware
 * 
 * Automatically logs API access events to Redis stream for audit purposes.
 * Captures user actions, IP addresses, and request details.
 */
@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);
  private readonly excludedPaths = [
    '/api/docs',
    '/api/docs-json',
    '/health',
    '/metrics',
    '/favicon.ico',
  ];

  constructor(
    private auditService: AuditService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Skip excluded paths
    if (this.excludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Extract user information from JWT token if present
    let userId: string | undefined;
    try {
      const token = this.extractToken(req);
      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
        userId = payload.sub;
      }
    } catch (error) {
      // Token is invalid or expired, continue without user ID
    }

    // Extract request information
    const ipAddress = this.getClientIp(req);
    const userAgent = req.get('User-Agent');
    const method = req.method;
    const endpoint = req.path;
    const queryParams = req.query;
    const bodyParams = this.sanitizeBody(req.body);

    // Store original end function
    const originalEnd = res.end;

    // Override response end to capture status code
    res.end = function(chunk?: any, encoding?: any): Response {
      const statusCode = res.statusCode;
      const duration = Date.now() - startTime;

      // Log API access event asynchronously (don't await to avoid blocking)
      this.auditService.logApiAccess(
        userId,
        method,
        endpoint,
        statusCode,
        ipAddress,
        userAgent,
      ).catch(error => {
        // Log error but don't throw to avoid breaking the request
        this.logger.error('Failed to log API access event:', error);
      });

      // Also log specific actions based on method and endpoint
      if (method !== 'GET') {
        this.auditService.logSpecificAction(
          userId,
          method,
          endpoint,
          statusCode,
          { queryParams, bodyParams, duration },
          ipAddress,
          userAgent,
        ).catch(error => {
          this.logger.error('Failed to log specific action:', error);
        });
      }

      // Call original end function
      return originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  /**
   * Extract JWT token from request
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Log specific action based on HTTP method and endpoint
   */
  private async logSpecificAction(
    userId: string | undefined,
    method: string,
    endpoint: string,
    statusCode: number,
    details: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    let action = 'api.unknown';
    let resource = 'API';

    // Map HTTP methods and endpoints to specific actions
    if (method === 'POST') {
      if (endpoint.includes('/appointments')) {
        action = 'appointment.create';
        resource = 'Appointment';
      } else if (endpoint.includes('/reviews')) {
        action = 'review.create';
        resource = 'Review';
      } else if (endpoint.includes('/auth/login')) {
        action = 'user.login';
        resource = 'User';
      } else if (endpoint.includes('/auth/logout')) {
        action = 'user.logout';
        resource = 'User';
      } else if (endpoint.includes('/upload')) {
        action = 'file.upload';
        resource = 'File';
      } else {
        action = 'api.create';
      }
    } else if (method === 'PUT' || method === 'PATCH') {
      if (endpoint.includes('/appointments')) {
        action = 'appointment.update';
        resource = 'Appointment';
      } else if (endpoint.includes('/users')) {
        action = 'user.update';
        resource = 'User';
      } else {
        action = 'api.update';
      }
    } else if (method === 'DELETE') {
      if (endpoint.includes('/appointments')) {
        action = 'appointment.delete';
        resource = 'Appointment';
      } else if (endpoint.includes('/reviews')) {
        action = 'review.delete';
        resource = 'Review';
      } else {
        action = 'api.delete';
      }
    }

    return this.auditService.logEvent({
      userId,
      action,
      resource,
      resourceId: this.extractResourceId(endpoint),
      details,
      ipAddress,
      userAgent,
      status: statusCode < 400 ? 'SUCCESS' : 'FAILED',
    });
  }

  /**
   * Extract resource ID from endpoint
   */
  private extractResourceId(endpoint: string): string | undefined {
    const parts = endpoint.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Check if last part looks like an ID (UUID or numeric)
    if (lastPart && (lastPart.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || 
                    lastPart.match(/^\d+$/))) {
      return lastPart;
    }
    
    return undefined;
  }
}
