import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { RedisService } from '../modules/common/redis/redis.service';
import { ConfigService } from '@nestjs/config';

/**
 * Chat Persistence Worker
 * 
 * This worker consumes chat messages from Redis streams and persists them to PostgreSQL.
 * It runs independently from the main API server and handles message persistence
 * in batches for better performance.
 */
@Injectable()
export class ChatPersistenceWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatPersistenceWorker.name);
  private readonly streamName = 'chat_stream';
  private readonly groupName = 'chat_persistence_group';
  private readonly consumerName = `chat_worker_${process.pid}`;
  private isRunning = false;
  private processingInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Initializing Chat Persistence Worker...');
    
    try {
      // Create consumer group for chat stream
      await this.redis.createConsumerGroup(this.streamName, this.groupName);
      this.logger.log(`✅ Created consumer group ${this.groupName} for stream ${this.streamName}`);
      
      // Start processing messages
      this.startProcessing();
      
      this.logger.log('✅ Chat Persistence Worker initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Chat Persistence Worker:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Shutting down Chat Persistence Worker...');
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    this.logger.log('✅ Chat Persistence Worker shut down');
  }

  /**
   * Start processing messages from Redis stream
   */
  private startProcessing() {
    this.isRunning = true;
    const batchSize = this.configService.get('CHAT_BATCH_SIZE', 10);
    const processingInterval = this.configService.get('CHAT_PROCESSING_INTERVAL', 1000);
    
    this.processingInterval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.processMessages(batchSize);
        } catch (error) {
          this.logger.error('Error processing chat messages:', error);
        }
      }
    }, processingInterval);
    
    this.logger.log(`🔄 Started processing chat messages (batch size: ${batchSize}, interval: ${processingInterval}ms)`);
  }

  /**
   * Process messages from Redis stream
   */
  private async processMessages(batchSize: number) {
    try {
      // Read messages from stream
      const messages = await this.redis.readFromStream(
        this.streamName,
        this.groupName,
        this.consumerName,
        batchSize,
        1000 // 1 second block timeout
      );

      if (messages.length === 0) {
        return; // No messages to process
      }

      this.logger.debug(`📥 Processing ${messages.length} chat messages`);

      // Process messages in batches
      const batches = this.chunkArray(messages, 5); // Process 5 messages at a time
      
      for (const batch of batches) {
        await this.processBatch(batch);
      }

    } catch (error) {
      this.logger.error('Error in processMessages:', error);
    }
  }

  /**
   * Process a batch of messages
   */
  private async processBatch(messages: any[]) {
    const messageIds: string[] = [];
    
    try {
      // Prepare messages for batch insert
      const chatMessages = messages.map(msg => {
        messageIds.push(msg.id);
        try {
          const data = JSON.parse(msg.fields.data);
          console.log('Processing message:', data);

          return {
            id: data.id,
            roomId: data.roomId || null,
            senderId: data.senderId,
            receiverId: data.receiverId || null,
            content: data.content,
            status: data.status || 'SENT',
            messageType: data.messageType || 'TEXT',
            createdAt: new Date(data.createdAt),
          };
        } catch (parseError) {
          this.logger.error(`Failed to parse message ${msg.id}:`, parseError);
          throw parseError;
        }
      });

      // Batch insert to database
      await this.prisma.chatMessage.createMany({
        data: chatMessages,
        skipDuplicates: true, // Skip if message already exists
      });

      this.logger.debug(`💾 Persisted ${chatMessages.length} chat messages to database`);

      // Acknowledge all messages in this batch
      for (const messageId of messageIds) {
        await this.redis.acknowledgeMessage(this.streamName, this.groupName, messageId);
      }

      this.logger.debug(`✅ Acknowledged ${messageIds.length} messages`);

    } catch (error) {
      this.logger.error('Error processing batch:', error);
      
      // Don't acknowledge messages if batch processing failed
      // They will be reprocessed later
      throw error;
    }
  }

  /**
   * Process pending messages that may have been stuck
   */
  async processPendingMessages() {
    try {
      this.logger.log('🔍 Checking for pending messages...');
      
      const pendingInfo = await this.redis.getPendingMessages(this.streamName, this.groupName);
      
      if (pendingInfo && pendingInfo.length > 0) {
        this.logger.log(`📋 Found ${pendingInfo.length} pending messages`);
        
        // Claim pending messages that have been idle for more than 1 minute
        const claimedMessages = await this.redis.claimPendingMessages(
          this.streamName,
          this.groupName,
          this.consumerName,
          60000, // 1 minute
          10
        );
        
        if (claimedMessages.length > 0) {
          this.logger.log(`🔄 Claimed ${claimedMessages.length} pending messages`);
          await this.processBatch(claimedMessages);
        }
      }
    } catch (error) {
      this.logger.error('Error processing pending messages:', error);
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
        pendingMessages: pendingInfo?.length || 0,
        lastProcessedId: streamInfo?.lastEntry?.id || '0',
      };
    } catch (error) {
      this.logger.error('Error getting worker stats:', error);
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
