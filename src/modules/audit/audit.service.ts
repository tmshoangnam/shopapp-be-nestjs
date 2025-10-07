import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

export interface AuditEventData {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
}

/**
 * Audit Service
 * 
 * Handles audit logging by publishing events to Redis streams
 * for asynchronous processing by the Audit Worker.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly streamName = 'audit_stream';

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Log an audit event to Redis stream
   */
  async logEvent(eventData: AuditEventData): Promise<string> {
    try {
      const auditEvent = {
        id: uuidv4(),
        ...eventData,
        createdAt: new Date().toISOString(),
      };

      const streamData = {
        data: JSON.stringify(auditEvent),
      };

      const messageId = await this.redis.publishToStream(this.streamName, streamData);
      
      this.logger.debug(`📝 Published audit event: ${eventData.action}`, {
        userId: eventData.userId,
        resource: eventData.resource,
        messageId,
      });

      return messageId;
    } catch (error) {
      this.logger.error('Failed to log audit event:', error);
      throw error;
    }
  }

  /**
   * Log user login event
   */
  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'user.login',
      resource: 'User',
      resourceId: userId,
      details: { loginMethod: 'jwt' },
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });
  }

  /**
   * Log user logout event
   */
  async logUserLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'user.logout',
      resource: 'User',
      resourceId: userId,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });
  }

  /**
   * Log appointment creation event
   */
  async logAppointmentCreate(userId: string, appointmentId: string, details?: any, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'appointment.create',
      resource: 'Appointment',
      resourceId: appointmentId,
      details,
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log appointment update event
   */
  async logAppointmentUpdate(userId: string, appointmentId: string, details?: any, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'appointment.update',
      resource: 'Appointment',
      resourceId: appointmentId,
      details,
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log appointment cancellation event
   */
  async logAppointmentCancel(userId: string, appointmentId: string, details?: any, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'appointment.cancel',
      resource: 'Appointment',
      resourceId: appointmentId,
      details,
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log review creation event
   */
  async logReviewCreate(userId: string, reviewId: string, serviceId: string, rating: number, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'review.create',
      resource: 'Review',
      resourceId: reviewId,
      details: { serviceId, rating },
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log file upload event
   */
  async logFileUpload(userId: string, fileId: string, fileName: string, fileSize: number, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'file.upload',
      resource: 'File',
      resourceId: fileId,
      details: { fileName, fileSize },
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log chat message event
   */
  async logChatMessage(userId: string, messageId: string, roomId?: string, receiverId?: string, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'chat.message',
      resource: 'ChatMessage',
      resourceId: messageId,
      details: { roomId, receiverId },
      ipAddress,
      status: 'SUCCESS',
    });
  }

  /**
   * Log API access event
   */
  async logApiAccess(userId: string, method: string, endpoint: string, statusCode: number, ipAddress?: string, userAgent?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: 'api.access',
      resource: 'API',
      resourceId: endpoint,
      details: { method, statusCode },
      ipAddress,
      userAgent,
      status: statusCode < 400 ? 'SUCCESS' : 'FAILED',
    });
  }

  /**
   * Log system event
   */
  async logSystemEvent(action: string, details?: any): Promise<string> {
    return this.logEvent({
      action: `system.${action}`,
      resource: 'System',
      details,
      status: 'SUCCESS',
    });
  }

  /**
   * Log error event
   */
  async logError(userId: string | undefined, action: string, error: any, ipAddress?: string): Promise<string> {
    return this.logEvent({
      userId,
      action: `error.${action}`,
      resource: 'Error',
      details: {
        error: error.message || error,
        stack: error.stack,
      },
      ipAddress,
      status: 'FAILED',
    });
  }

  /**
   * Get audit logs from database (for querying)
   */
  async getAuditLogs(params: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const {
      userId,
      action,
      resource,
      status,
      startDate,
      endDate,
      skip = 0,
      take = 50,
    } = params;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = resource;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: auditLogs, total };
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalLogs,
      successLogs,
      failedLogs,
      uniqueUsers,
      topActions,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({
        where: { ...where, status: 'SUCCESS' },
      }),
      this.prisma.auditLog.count({
        where: { ...where, status: 'FAILED' },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
      }).then(result => result.length),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      successLogs,
      failedLogs,
      uniqueUsers,
      successRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0,
      topActions: topActions.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
    };
  }
}
