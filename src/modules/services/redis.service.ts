import type { OnModuleDestroy } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { StellaConfig } from 'src/configs';

const logger = new Logger('Redis');

@Injectable()
export class RedisService implements OnModuleDestroy {
  private redis: Redis;
  private host: string;
  private port: number;
  private password?: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private readonly maxReconnectAttempts = 10;
  private reconnectAttempts = 0;
  private readonly reconnectInterval = 5000; // 5 seconds

  constructor(private readonly configService: ConfigService<StellaConfig>) {
    this.host = this.configService.get('redis.host', { infer: true });
    this.port = this.configService.get('redis.port', { infer: true });
    this.password = this.configService.get('redis.password', { infer: true });

    this.initRedisConnection();
  }

  private initRedisConnection() {
    try {
      this.redis = new Redis({
        host: this.host,
        port: this.port,
        password: this.password,
        lazyConnect: true,
        keepAlive: 1000,
        connectTimeout: 10000, // 10 seconds
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 1000, 5000);
          logger.warn(
            `Redis connection attempt ${times}. Retrying in ${delay}ms...`,
          );
          return delay;
        },
      });

      this.setupEventListeners();

      // Connect to Redis
      this.redis.connect().catch((error) => {
        logger.error(`Failed to connect to Redis: ${error.message}`);
        this.scheduleReconnect();
      });
    } catch (error) {
      logger.error(`Error initializing Redis client: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners() {
    this.redis.on('connect', () => {
      logger.log(`Connecting to Redis at ${this.host}:${this.port}...`);
    });

    this.redis.on('ready', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.log(
        `Successfully connected to Redis at ${this.host}:${this.port}`,
      );
    });

    this.redis.on('error', (error) => {
      logger.error(`Redis error: ${error.message}`);
      if (!this.isConnected) {
        this.scheduleReconnect();
      }
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
      this.scheduleReconnect();
    });

    this.redis.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis connection ended');
    });
  }

  private scheduleReconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Check if max reconnect attempts reached
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        `Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`,
      );
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts += 1;
      logger.log(
        `Attempting to reconnect to Redis (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      // Disconnect the old client if it exists
      if (this.redis) {
        this.redis.disconnect();
      }

      // Create a new connection
      this.initRedisConnection();
    }, this.reconnectInterval);
  }

  onModuleDestroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.redis) {
      this.redis.disconnect();
      logger.log('Redis connection closed gracefully');
    }
  }

  getClient(): Redis {
    if (!this.isConnected) {
      logger.warn('Trying to use Redis client while disconnected');
    }
    return this.redis;
  }

  /**
   * This method retrieves data from Redis.
   * @param key - The key of the data to retrieve.
   * @returns The data associated with the key, or null if the key does not exist.
   */
  async get(key: string) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * This method stores data in Redis.
   * @param key - The key under which to store the data.
   * @param value - The data to store.
   * @param ttl - The time-to-live (in seconds) after which the data should be deleted.
   * @returns A promise that resolves when the data has been stored.
   */
  async set(key: string, value: any, ttl: number) {
    try {
      return await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error(`Error setting key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * This method deletes data from Redis.
   * @param key - The key of the data to delete.
   * @returns A promise that resolves when the data has been deleted.
   */
  async del(key: string) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      logger.error(`Error deleting key ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Checks if the Redis connection is healthy
   * @returns boolean indicating if Redis is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }
}
