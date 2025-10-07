import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { RedisService } from '../modules/common/redis/redis.service';
import { ConfigService } from '@nestjs/config';

/**
 * Audit Worker
 * 
 * This worker consumes audit events from Redis streams and persists them to PostgreSQL.
 * It handles audit logs for all user actions and system events for compliance and monitoring.
 */
@Injectable()
export class AuditWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditWorker.name);
  private readonly streamName = 'audit_stream';
  private readonly groupName = 'audit_persistence_group';
  private readonly consumerName = `audit_worker_${process.pid}`;
  private isRunning = false;
  private processingInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Initializing Audit Worker...');
    
    try {
      // Create consumer group for audit stream
      await this.redis.createConsumerGroup(this.streamName, this.groupName);
      this.logger.log(`✅ Created consumer group ${this.groupName} for stream ${this.streamName}`);
      
      // Start processing messages
      this.startProcessing();
      
      this.logger.log('✅ Audit Worker initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Audit Worker:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Shutting down Audit Worker...');
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.logger.log('✅ Audit Worker shut down');
  }

  /**
   * Start processing audit events from Redis stream
   */
  private startProcessing() {
    this.isRunning = true;
    const batchSize = this.configService.get('AUDIT_BATCH_SIZE', 20);
    const processingInterval = this.configService.get('AUDIT_PROCESSING_INTERVAL', 2000);
    
    this.processingInterval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.processAuditEvents(batchSize);
        } catch (error) {
          this.logger.error('Error processing audit events:', error);
        }
      }
    }, processingInterval);
    
    this.logger.log(`🔄 Started processing audit events (batch size: ${batchSize}, interval: ${processingInterval}ms)`);
  }

  /**
   * Process audit events from Redis stream
   */
  private async processAuditEvents(batchSize: number) {
    try {
      // Read events from stream
      const events = await this.redis.readFromStream(
        this.streamName,
        this.groupName,
        this.consumerName,
        batchSize,
        1000 // 1 second block timeout
      );

      if (events.length === 0) {
        return; // No events to process
      }

      this.logger.debug(`📥 Processing ${events.length} audit events`);

      // Process events in batches
      const batches = this.chunkArray(events, 10); // Process 10 events at a time
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }

    } catch (error) {
      this.logger.error('Error in processAuditEvents:', error);
    }
  }

  /**
   * Process a batch of audit events
   */
  private async processBatch(events: any[]) {
    const eventIds: string[] = [];
    
    try {
      // Prepare audit logs for batch insert
      const auditLogs = events.map(event => {
        eventIds.push(event.id);
        
        try {
          const data = JSON.parse(event.fields.data);
          return {
            id: data.id,
            userId: data.userId || null,
            action: data.action,
            resource: data.resource || null,
            resourceId: data.resourceId || null,
            details: data.details || null,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
            status: data.status || 'SUCCESS',
            createdAt: new Date(data.createdAt),
          };
        } catch (parseError) {
          this.logger.error(`Failed to parse audit event ${event.id}:`, parseError);
          throw parseError;
        }
      });

      // Batch insert to database
      await this.prisma.auditLog.createMany({
        data: auditLogs,
        skipDuplicates: true, // Skip if audit log already exists
      });

      this.logger.debug(`💾 Persisted ${auditLogs.length} audit logs to database`);

      // Acknowledge all events in this batch
      for (const eventId of eventIds) {
        await this.redis.acknowledgeMessage(this.streamName, this.groupName, eventId);
      }

      this.logger.debug(`✅ Acknowledged ${eventIds.length} audit events`);

    } catch (error) {
      this.logger.error('Error processing audit batch:', error);
      
      // Don't acknowledge events if batch processing failed
      // They will be reprocessed later
      throw error;
    }
  }

  /**
   * Process pending audit events that may have been stuck
   */
  async processPendingEvents() {
    try {
      this.logger.log('🔍 Checking for pending audit events...');
      
      const pendingInfo = await this.redis.getPendingMessages(this.streamName, this.groupName);
      
      if (pendingInfo && pendingInfo.length > 0) {
        this.logger.log(`📋 Found ${pendingInfo.length} pending audit events`);
        
        // Claim pending events that have been idle for more than 2 minutes
        const claimedEvents = await this.redis.claimPendingMessages(
          this.streamName,
          this.groupName,
          this.consumerName,
          120000, // 2 minutes
          20
        );
        
        if (claimedEvents.length > 0) {
          this.logger.log(`🔄 Claimed ${claimedEvents.length} pending audit events`);
          await this.processBatch(claimedEvents);
        }
      }
    } catch (error) {
      this.logger.error('Error processing pending audit events:', error);
    }
  }

  /**
   * Get worker statistics
   */
  async getStats() {
    try {
      const streamInfo = await this.redis.getStreamInfo(this.streamName);
      const pendingInfo = await this.redis.getPendingMessages(this.streamName, this.groupName);
      
      return {
        streamName: this.streamName,
        groupName: this.groupName,
        consumerName: this.consumerName,
        isRunning: this.isRunning,
        streamLength: streamInfo?.length || 0,
        pendingEvents: pendingInfo?.length || 0,
        lastProcessedId: streamInfo?.lastEntry?.id || '0',
      };
    } catch (error) {
      this.logger.error('Error getting audit worker stats:', error);
      return null;
    }
  }

  /**
   * Get audit statistics from database
   */
  async getAuditStats() {
    try {
      const [
        totalLogs,
        successLogs,
        failedLogs,
        logsToday,
        uniqueUsers,
      ] = await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.count({
          where: { status: 'SUCCESS' },
        }),
        this.prisma.auditLog.count({
          where: { status: 'FAILED' },
        }),
        this.prisma.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        this.prisma.auditLog.groupBy({
          by: ['userId'],
          where: {
            userId: { not: null },
          },
        }).then(result => result.length),
      ]);

      return {
        totalLogs,
        successLogs,
        failedLogs,
        logsToday,
        uniqueUsers,
        successRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0,
      };
    } catch (error) {
      this.logger.error('Error getting audit stats:', error);
      return null;
    }
  }

  /**
   * Utility function to chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
