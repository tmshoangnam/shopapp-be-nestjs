import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { RedisModule } from '../common/redis/redis.module';

/**
 * Audit Module
 * 
 * Provides audit logging functionality for tracking user actions and system events.
 * Includes middleware for automatic audit logging and API endpoints for querying audit logs.
 */
@Module({
  imports: [RedisModule],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
