import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

/**
 * Redis Service
 * 
 * Shared Redis service for both API and Worker services.
 * Handles Redis connections, streams, and common operations.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: ReturnType<typeof createClient>;
  private subscriber: ReturnType<typeof createClient>;
  private publisher: ReturnType<typeof createClient>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6380';
    
    try {
      // Main client for general operations
      this.client = createClient({
        url: redisUrl,
      });

      // Subscriber client for pub/sub operations
      this.subscriber = createClient({
        url: redisUrl,
      });

      // Publisher client for pub/sub operations
      this.publisher = createClient({
        url: redisUrl,
      });

      // Connect all clients
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
      ]);

      // Event handlers
      this.client.on('error', (err) => {
        this.logger.error('Redis client error:', err);
      });

      this.subscriber.on('error', (err) => {
        this.logger.error('Redis subscriber error:', err);
      });

      this.publisher.on('error', (err) => {
        this.logger.error('Redis publisher error:', err);
      });

      this.logger.log('✅ Redis service initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis service:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await Promise.all([
        this.client?.disconnect(),
        this.subscriber?.disconnect(),
        this.publisher?.disconnect(),
      ]);
      this.logger.log('✅ Redis service disconnected');
    } catch (error) {
      this.logger.error('❌ Error disconnecting Redis service:', error);
    }
  }

  /**
   * Get the main Redis client
   */
  getClient(): ReturnType<typeof createClient> {
    return this.client;
  }

  /**
   * Get the subscriber client
   */
  getSubscriber(): ReturnType<typeof createClient> {
    return this.subscriber;
  }

  /**
   * Get the publisher client
   */
  getPublisher(): ReturnType<typeof createClient> {
    return this.publisher;
  }

  /**
   * Publish a message to a Redis stream
   */
  async publishToStream(streamName: string, data: Record<string, any>): Promise<string> {
    try {
      const result = await this.client.xAdd(streamName, '*', data);
      this.logger.debug(`Published to stream ${streamName}:`, data);
      return result;
    } catch (error) {
      this.logger.error(`Failed to publish to stream ${streamName}:`, error);
      throw error;
    }
  }

  /**
   * Create a consumer group for a stream
   */
  async createConsumerGroup(streamName: string, groupName: string, startId: string = '0'): Promise<void> {
    try {
      await this.client.xGroupCreate(streamName, groupName, startId, {
        MKSTREAM: true, // Create stream if it doesn't exist
      });
      this.logger.log(`Created consumer group ${groupName} for stream ${streamName}`);
    } catch (error) {
      if (error.message.includes('BUSYGROUP')) {
        this.logger.debug(`Consumer group ${groupName} already exists for stream ${streamName}`);
      } else {
        this.logger.error(`Failed to create consumer group ${groupName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Read messages from a stream using consumer group
   */
  async readFromStream(
    streamName: string,
    groupName: string,
    consumerName: string,
    count: number = 10,
    block: number = 1000
  ): Promise<any[]> {
    try {
      const result = await this.client.xReadGroup(
        groupName,
        consumerName,
        [
          {
            key: streamName,
            id: '>',
          },
        ],
        {
          COUNT: count,
          BLOCK: block,
        }
      );

      if (!result || result.length === 0) {
        return [];
      }

      return result[0].messages.map(msg => ({
        id: msg.id,
        fields: msg.message,
      }));
    } catch (error) {
      if (error.message.includes('NOGROUP')) {
        // Create the consumer group if it doesn't exist
        await this.createConsumerGroup(streamName, groupName);
        return this.readFromStream(streamName, groupName, consumerName, count, block);
      }
      this.logger.error(`Failed to read from stream ${streamName}:`, error);
      throw error;
    }
  }

  /**
   * Acknowledge message processing
   */
  async acknowledgeMessage(streamName: string, groupName: string, messageId: string): Promise<number> {
    try {
      const result = await this.client.xAck(streamName, groupName, messageId);
      this.logger.debug(`Acknowledged message ${messageId} in stream ${streamName}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to acknowledge message ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Get stream info
   */
  async getStreamInfo(streamName: string): Promise<any> {
    try {
      const info = await this.client.xInfoStream(streamName);
      return info;
    } catch (error) {
      this.logger.error(`Failed to get stream info for ${streamName}:`, error);
      throw error;
    }
  }

  /**
   * Get pending messages for a consumer group
   */
  async getPendingMessages(streamName: string, groupName: string): Promise<any> {
    try {
      const result = await this.client.xPending(streamName, groupName);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get pending messages for ${streamName}:`, error);
      throw error;
    }
  }

  /**
   * Claim pending messages
   */
  async claimPendingMessages(
    streamName: string,
    groupName: string,
    consumerName: string,
    minIdleTime: number = 60000,
    count: number = 10
  ): Promise<any[]> {
    try {
      const result = await (this.client as any).xClaim(
        streamName,
        groupName,
        consumerName,
        minIdleTime,
        '0-0',
        {
          COUNT: count,
        }
      );

      return result.map((msg: any) => ({
        id: msg.id,
        fields: msg.message,
      }));
    } catch (error) {
      this.logger.error(`Failed to claim pending messages:`, error);
      throw error;
    }
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment a key value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrement a key value
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error(`Failed to decrement key ${key}:`, error);
      throw error;
    }
  }
}
