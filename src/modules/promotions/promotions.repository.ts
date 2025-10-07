import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IPromotionRepository,
  CreatePromotionDto,
  UpdatePromotionDto,
  FindAllPromotionsOptions,
  PaginatedResult,
  CreatePromotionUsageDto,
} from './interfaces/promotion.interface';
import { PromotionEntity, PromotionUsageEntity, PromotionStatsEntity } from './entities/promotion.entity';
import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Repository for managing promotion data access
 * @class PromotionsRepository
 */
@Injectable()
export class PromotionsRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new promotion
   * @param data - Promotion creation data
   * @returns Promise<PromotionEntity>
   */
  async create(data: CreatePromotionDto): Promise<PromotionEntity> {
    const promotion = await this.prisma.promotion.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        targetIds: data.targetIds || [],
      },
    });

    return this.mapToEntity(promotion);
  }

  /**
   * Find all promotions with pagination and filtering
   * @param options - Query options
   * @returns Promise<PaginatedResult<PromotionEntity>>
   */
  async findAll(options: FindAllPromotionsOptions = {}): Promise<PaginatedResult<PromotionEntity>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
      targetType,
      type,
      startDate,
      endDate,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (type) {
      where.type = type;
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    // Execute queries in parallel
    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          usages: {
            select: {
              id: true,
              userId: true,
              discountAmount: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return {
      data: promotions.map(promotion => this.mapToEntity(promotion)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find promotion by ID
   * @param id - Promotion ID
   * @returns Promise<PromotionEntity | null>
   */
  async findById(id: string): Promise<PromotionEntity | null> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return promotion ? this.mapToEntity(promotion) : null;
  }

  /**
   * Find promotion by code
   * @param code - Promotion code
   * @returns Promise<PromotionEntity | null>
   */
  async findByCode(code: string): Promise<PromotionEntity | null> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { code },
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return promotion ? this.mapToEntity(promotion) : null;
  }

  /**
   * Update promotion
   * @param id - Promotion ID
   * @param data - Update data
   * @returns Promise<PromotionEntity>
   */
  async update(id: string, data: UpdatePromotionDto): Promise<PromotionEntity> {
    const updateData: any = { ...data };

    // Convert date strings to Date objects if provided
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const promotion = await this.prisma.promotion.update({
      where: { id },
      data: updateData,
      include: {
        usages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return this.mapToEntity(promotion);
  }

  /**
   * Delete promotion
   * @param id - Promotion ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    await this.prisma.promotion.delete({
      where: { id },
    });
  }

  /**
   * Find active promotions
   * @returns Promise<PromotionEntity[]>
   */
  async findActivePromotions(): Promise<PromotionEntity[]> {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return promotions.map(promotion => this.mapToEntity(promotion));
  }

  /**
   * Find promotions by target
   * @param targetType - Target type
   * @param targetIds - Target IDs
   * @returns Promise<PromotionEntity[]>
   */
  async findPromotionsByTarget(
    targetType: PromotionTarget,
    targetIds?: string[],
  ): Promise<PromotionEntity[]> {
    const where: any = {
      targetType,
      isActive: true,
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    };

    if (targetIds && targetIds.length > 0) {
      where.targetIds = {
        hasSome: targetIds,
      };
    }

    const promotions = await this.prisma.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return promotions.map(promotion => this.mapToEntity(promotion));
  }

  /**
   * Increment usage count for a promotion
   * @param promotionId - Promotion ID
   * @returns Promise<void>
   */
  async incrementUsageCount(promotionId: string): Promise<void> {
    await this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Create promotion usage record
   * @param usageData - Usage data
   * @returns Promise<PromotionUsageEntity>
   */
  async createUsage(usageData: CreatePromotionUsageDto): Promise<PromotionUsageEntity> {
    const usage = await this.prisma.promotionUsage.create({
      data: {
        promotionId: usageData.promotionId,
        userId: usageData.userId,
        bookingId: usageData.bookingId,
        discountAmount: usageData.discountAmount,
        originalAmount: usageData.originalAmount,
        finalAmount: usageData.finalAmount,
      },
    });

    return this.mapUsageToEntity(usage);
  }

  /**
   * Get user usage count for a promotion
   * @param promotionId - Promotion ID
   * @param userId - User ID
   * @returns Promise<number>
   */
  async getUserUsageCount(promotionId: string, userId: string): Promise<number> {
    const count = await this.prisma.promotionUsage.count({
      where: {
        promotionId,
        userId,
      },
    });

    return count;
  }

  /**
   * Get promotion statistics
   * @param promotionId - Promotion ID
   * @returns Promise<PromotionStatsEntity>
   */
  async getPromotionStats(promotionId: string): Promise<PromotionStatsEntity> {
    const stats = await this.prisma.promotionUsage.aggregate({
      where: { promotionId },
      _count: {
        id: true,
        userId: true,
      },
      _sum: {
        discountAmount: true,
        finalAmount: true,
      },
      _avg: {
        finalAmount: true,
      },
    });

    const uniqueUsers = await this.prisma.promotionUsage.groupBy({
      by: ['userId'],
      where: { promotionId },
    });

    return {
      promotionId,
      totalUsage: stats._count.id,
      totalDiscountGiven: Number(stats._sum.discountAmount || 0),
      totalRevenue: Number(stats._sum.finalAmount || 0),
      uniqueUsers: uniqueUsers.length,
      conversionRate: 0, // This would need to be calculated based on business logic
      averageOrderValue: Number(stats._avg.finalAmount || 0),
    };
  }

  /**
   * Map Prisma promotion to entity
   * @param promotion - Prisma promotion object
   * @returns PromotionEntity
   */
  private mapToEntity(promotion: any): PromotionEntity {
    return {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: Number(promotion.value),
      minOrderAmount: promotion.minOrderAmount ? Number(promotion.minOrderAmount) : undefined,
      maxDiscountAmount: promotion.maxDiscountAmount ? Number(promotion.maxDiscountAmount) : undefined,
      usageLimit: promotion.usageLimit,
      usedCount: promotion.usedCount,
      userUsageLimit: promotion.userUsageLimit,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
      targetType: promotion.targetType,
      targetIds: promotion.targetIds,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
      createdBy: promotion.createdBy,
      usages: promotion.usages?.map((usage: any) => this.mapUsageToEntity(usage)),
    };
  }

  /**
   * Map Prisma usage to entity
   * @param usage - Prisma usage object
   * @returns PromotionUsageEntity
   */
  private mapUsageToEntity(usage: any): PromotionUsageEntity {
    return {
      id: usage.id,
      promotionId: usage.promotionId,
      userId: usage.userId,
      bookingId: usage.bookingId,
      discountAmount: Number(usage.discountAmount),
      originalAmount: Number(usage.originalAmount),
      finalAmount: Number(usage.finalAmount),
      createdAt: usage.createdAt,
      promotion: usage.promotion ? this.mapToEntity(usage.promotion) : undefined,
    };
  }
}
