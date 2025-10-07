import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { IPromotionService, IPromotionRepository } from './interfaces/promotion.interface';
import { PromotionsRepository } from './promotions.repository';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  FindAllPromotionsOptions,
  PaginatedResult,
  ValidationResult,
  PromotionApplicationResult,
} from './interfaces/promotion.interface';
import { PromotionEntity, PromotionUsageEntity, PromotionStatsEntity } from './entities/promotion.entity';
import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Service for managing promotion business logic
 * @class PromotionsService
 */
@Injectable()
export class PromotionsService implements IPromotionService {
  constructor(
    private readonly promotionsRepository: PromotionsRepository,
  ) {}

  /**
   * Create a new promotion
   * @param createPromotionDto - Promotion creation data
   * @returns Promise<PromotionEntity>
   * @throws {ConflictException} When promotion code already exists
   * @throws {BadRequestException} When validation fails
   */
  async create(createPromotionDto: CreatePromotionDto): Promise<PromotionEntity> {
    // Check if promotion code already exists
    const existingPromotion = await this.promotionsRepository.findByCode(createPromotionDto.code);
    if (existingPromotion) {
      throw new ConflictException(`Promotion with code '${createPromotionDto.code}' already exists`);
    }

    // Validate promotion data
    this.validatePromotionData(createPromotionDto);

    // Create promotion
    return this.promotionsRepository.create(createPromotionDto);
  }

  /**
   * Find all promotions with pagination and filtering
   * @param options - Query options
   * @returns Promise<PaginatedResult<PromotionEntity>>
   */
  async findAll(options?: FindAllPromotionsOptions): Promise<PaginatedResult<PromotionEntity>> {
    return this.promotionsRepository.findAll(options);
  }

  /**
   * Find promotion by ID
   * @param id - Promotion ID
   * @returns Promise<PromotionEntity>
   * @throws {NotFoundException} When promotion not found
   */
  async findById(id: string): Promise<PromotionEntity> {
    const promotion = await this.promotionsRepository.findById(id);
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID '${id}' not found`);
    }
    return promotion;
  }

  /**
   * Find promotion by code
   * @param code - Promotion code
   * @returns Promise<PromotionEntity>
   * @throws {NotFoundException} When promotion not found
   */
  async findByCode(code: string): Promise<PromotionEntity> {
    const promotion = await this.promotionsRepository.findByCode(code);
    if (!promotion) {
      throw new NotFoundException(`Promotion with code '${code}' not found`);
    }
    return promotion;
  }

  /**
   * Update promotion
   * @param id - Promotion ID
   * @param updatePromotionDto - Update data
   * @returns Promise<PromotionEntity>
   * @throws {NotFoundException} When promotion not found
   * @throws {BadRequestException} When validation fails
   */
  async update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<PromotionEntity> {
    // Check if promotion exists
    await this.findById(id);

    // Validate update data
    if (updatePromotionDto.value !== undefined) {
      this.validatePromotionValue(updatePromotionDto.value);
    }

    return this.promotionsRepository.update(id, updatePromotionDto);
  }

  /**
   * Delete promotion
   * @param id - Promotion ID
   * @returns Promise<void>
   * @throws {NotFoundException} When promotion not found
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.promotionsRepository.delete(id);
  }

  /**
   * Activate promotion
   * @param id - Promotion ID
   * @returns Promise<PromotionEntity>
   * @throws {NotFoundException} When promotion not found
   */
  async activate(id: string): Promise<PromotionEntity> {
    return this.promotionsRepository.update(id, { isActive: true });
  }

  /**
   * Deactivate promotion
   * @param id - Promotion ID
   * @returns Promise<PromotionEntity>
   * @throws {NotFoundException} When promotion not found
   */
  async deactivate(id: string): Promise<PromotionEntity> {
    return this.promotionsRepository.update(id, { isActive: false });
  }

  /**
   * Validate promotion for a user and order amount
   * @param code - Promotion code
   * @param userId - User ID
   * @param orderAmount - Order amount
   * @returns Promise<ValidationResult>
   */
  async validatePromotion(code: string, userId: string, orderAmount: number): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Find promotion
      const promotion = await this.promotionsRepository.findByCode(code);
      if (!promotion) {
        errors.push('Promotion not found');
        return { isValid: false, errors };
      }

      // Check if promotion is active
      if (!promotion.isActive) {
        errors.push('Promotion is not active');
      }

      // Check date validity
      const now = new Date();
      if (promotion.startDate > now) {
        errors.push('Promotion has not started yet');
      }
      if (promotion.endDate && promotion.endDate < now) {
        errors.push('Promotion has expired');
      }

      // Check usage limits
      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        errors.push('Promotion usage limit exceeded');
      }

      // Check user usage limit
      const userUsageCount = await this.promotionsRepository.getUserUsageCount(promotion.id, userId);
      if (userUsageCount >= promotion.userUsageLimit) {
        errors.push('User usage limit exceeded for this promotion');
      }

      // Check minimum order amount
      if (promotion.minOrderAmount && orderAmount < Number(promotion.minOrderAmount)) {
        errors.push(`Minimum order amount of ${promotion.minOrderAmount} VND required`);
      }

      // Check target constraints
      if (promotion.targetType !== PromotionTarget.ALL) {
        // This would need to be implemented based on specific business logic
        // For now, we'll assume it's valid if target type is not ALL
        // In a real implementation, you'd check if the user/service/partner is in targetIds
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      // Calculate discount
      const discountAmount = this.calculateDiscount(promotion, orderAmount);
      const finalAmount = orderAmount - discountAmount;

      return {
        isValid: true,
        promotion,
        discountAmount,
        finalAmount,
      };
    } catch (error) {
      errors.push('Error validating promotion');
      return { isValid: false, errors };
    }
  }

  /**
   * Apply promotion to an order
   * @param code - Promotion code
   * @param userId - User ID
   * @param bookingId - Booking ID
   * @param orderAmount - Order amount
   * @returns Promise<PromotionApplicationResult>
   */
  async applyPromotion(code: string, userId: string, bookingId: string, orderAmount: number): Promise<PromotionApplicationResult> {
    // First validate the promotion
    const validation = await this.validatePromotion(code, userId, orderAmount);
    
    if (!validation.isValid || !validation.promotion) {
      return {
        success: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        errors: validation.errors,
      };
    }

    try {
      // Create usage record
      const usage = await this.promotionsRepository.createUsage({
        promotionId: validation.promotion.id,
        userId,
        bookingId,
        discountAmount: validation.discountAmount!,
        originalAmount: orderAmount,
        finalAmount: validation.finalAmount!,
      });

      // Increment usage count
      await this.promotionsRepository.incrementUsageCount(validation.promotion.id);

      return {
        success: true,
        usage,
        discountAmount: validation.discountAmount!,
        finalAmount: validation.finalAmount!,
      };
    } catch (error) {
      return {
        success: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        errors: ['Failed to apply promotion'],
      };
    }
  }

  /**
   * Get promotion statistics
   * @param promotionId - Promotion ID
   * @returns Promise<PromotionStatsEntity>
   * @throws {NotFoundException} When promotion not found
   */
  async getPromotionStats(promotionId: string): Promise<PromotionStatsEntity> {
    await this.findById(promotionId);
    return this.promotionsRepository.getPromotionStats(promotionId);
  }

  /**
   * Get available promotions for a user
   * @param userId - User ID
   * @param orderAmount - Order amount
   * @returns Promise<PromotionEntity[]>
   */
  async getAvailablePromotions(userId: string, orderAmount?: number): Promise<PromotionEntity[]> {
    const activePromotions = await this.promotionsRepository.findActivePromotions();
    
    const availablePromotions: PromotionEntity[] = [];

    for (const promotion of activePromotions) {
      // Check if promotion is available for this user
      if (orderAmount && promotion.minOrderAmount && orderAmount < Number(promotion.minOrderAmount)) {
        continue;
      }

      // Check usage limits
      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        continue;
      }

      // Check user usage limit
      const userUsageCount = await this.promotionsRepository.getUserUsageCount(promotion.id, userId);
      if (userUsageCount >= promotion.userUsageLimit) {
        continue;
      }

      availablePromotions.push(promotion);
    }

    return availablePromotions;
  }

  /**
   * Calculate discount amount for a promotion
   * @param promotion - Promotion entity
   * @param orderAmount - Order amount
   * @returns number
   */
  private calculateDiscount(promotion: PromotionEntity, orderAmount: number): number {
    let discountAmount = 0;

    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        discountAmount = (orderAmount * promotion.value) / 100;
        break;
      case PromotionType.FIXED_AMOUNT:
        discountAmount = promotion.value;
        break;
      case PromotionType.FREE_SHIPPING:
        // This would be handled differently in a real implementation
        discountAmount = 0;
        break;
      case PromotionType.BUY_X_GET_Y:
        // This would need complex business logic
        discountAmount = 0;
        break;
    }

    // Apply maximum discount limit if set
    if (promotion.maxDiscountAmount && discountAmount > Number(promotion.maxDiscountAmount)) {
      discountAmount = Number(promotion.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return Math.round(discountAmount);
  }

  /**
   * Validate promotion data
   * @param data - Promotion data
   * @throws {BadRequestException} When validation fails
   */
  private validatePromotionData(data: CreatePromotionDto): void {
    this.validatePromotionValue(data.value);

    // Validate date range
    if (data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate percentage values
    if (data.type === PromotionType.PERCENTAGE && data.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate minimum order amount
    if (data.minOrderAmount && data.minOrderAmount < 0) {
      throw new BadRequestException('Minimum order amount cannot be negative');
    }

    // Validate maximum discount amount
    if (data.maxDiscountAmount && data.maxDiscountAmount < 0) {
      throw new BadRequestException('Maximum discount amount cannot be negative');
    }

    // Validate usage limits
    if (data.usageLimit && data.usageLimit < 1) {
      throw new BadRequestException('Usage limit must be at least 1');
    }

    if (data.userUsageLimit && (data.userUsageLimit < 1 || data.userUsageLimit > 10)) {
      throw new BadRequestException('User usage limit must be between 1 and 10');
    }
  }

  /**
   * Validate promotion value
   * @param value - Promotion value
   * @throws {BadRequestException} When validation fails
   */
  private validatePromotionValue(value: number): void {
    if (value <= 0) {
      throw new BadRequestException('Promotion value must be positive');
    }
  }
}
