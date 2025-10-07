import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Redis Module
 * 
 * Global module providing Redis service for both API and Worker services.
 * This ensures consistent Redis connectivity across the application.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
