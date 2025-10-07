import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { LoggerModule } from '../modules/logger/logger.module';
import { RedisModule } from '../modules/common/redis/redis.module';
import { ChatPersistenceWorker } from './chat-persistence.worker';
import { AuditWorker } from './audit.worker';

/**
 * Worker Module
 * 
 * This module contains all background workers and services
 * that run independently from the main API server.
 * 
 * Workers included:
 * - ChatPersistenceWorker: Persists chat messages from Redis streams
 * - AuditWorker: Processes audit logs from Redis streams
 */
@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    
    // Core modules
    LoggerModule,
    PrismaModule,
    RedisModule,
  ],
  providers: [
    ChatPersistenceWorker,
    AuditWorker,
  ],
})
export class WorkerModule {}
