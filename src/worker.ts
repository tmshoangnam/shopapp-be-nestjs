import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WorkerModule } from './worker/worker.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * Worker Service Bootstrap
 * 
 * This worker service runs independently from the main API server
 * and handles background tasks like:
 * - Chat message persistence from Redis streams
 * - Audit log processing
 * - Notification queue processing
 * - Data synchronization tasks
 */
async function bootstrapWorker() {
  console.log('🚀 Starting Worker Service...');
  
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });

  // Setup Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  logger.log('🔧 Worker Service initialized successfully', 'WorkerBootstrap');
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV') || 'development'}`, 'WorkerBootstrap');
  logger.log(`📡 Redis URL: ${configService.get('REDIS_URL') || 'redis://localhost:6379'}`, 'WorkerBootstrap');
  logger.log(`🗄️  Database URL: ${configService.get('DATABASE_URL') ? '***configured***' : 'not configured'}`, 'WorkerBootstrap');

  // Keep the worker running
  process.on('SIGINT', async () => {
    logger.log('🛑 Worker Service shutting down...', 'WorkerBootstrap');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.log('🛑 Worker Service shutting down...', 'WorkerBootstrap');
    await app.close();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error, 'WorkerBootstrap');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason, 'WorkerBootstrap');
    process.exit(1);
  });

  logger.log('✅ Worker Service is running and ready to process tasks', 'WorkerBootstrap');
}

bootstrapWorker().catch((error) => {
  console.error('❌ Failed to start Worker Service:', error);
  process.exit(1);
});
