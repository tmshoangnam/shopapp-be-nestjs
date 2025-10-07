import { PromotionEntity, PromotionUsageEntity } from '../entities/promotion.entity';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
  PromotionUsageResponseDto,
} from '../dto';
import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Mapper class for converting between entities and DTOs
 * @class PromotionMapper
 */
export class PromotionMapper {
  /**
   * Map CreatePromotionDto to entity data
   * @param dto - Create promotion DTO
   * @returns Entity data
   */
  static fromCreateDto(dto: CreatePromotionDto): Partial<PromotionEntity> {
    return {
      code: dto.code,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      value: dto.value,
      minOrderAmount: dto.minOrderAmount,
      maxDiscountAmount: dto.maxDiscountAmount,
      usageLimit: dto.usageLimit,
      userUsageLimit: dto.userUsageLimit || 1,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      targetType: dto.targetType,
      targetIds: dto.targetIds || [],
      createdBy: dto.createdBy,
    };
  }

  /**
   * Map UpdatePromotionDto to entity data
   * @param dto - Update promotion DTO
   * @returns Entity data
   */
  static fromUpdateDto(dto: UpdatePromotionDto): Partial<PromotionEntity> {
    const data: Partial<PromotionEntity> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.value !== undefined) data.value = dto.value;
    if (dto.minOrderAmount !== undefined) data.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscountAmount !== undefined) data.maxDiscountAmount = dto.maxDiscountAmount;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;
    if (dto.userUsageLimit !== undefined) data.userUsageLimit = dto.userUsageLimit;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.targetType !== undefined) data.targetType = dto.targetType;
    if (dto.targetIds !== undefined) data.targetIds = dto.targetIds;

    return data;
  }

  /**
   * Map entity to PromotionResponseDto
   * @param entity - Promotion entity
   * @returns Promotion response DTO
   */
  static toResponseDto(entity: PromotionEntity): PromotionResponseDto {
    const now = new Date();
    const isValid = entity.isActive &&
      entity.startDate <= now &&
      (!entity.endDate || entity.endDate >= now) &&
      (!entity.usageLimit || entity.usedCount < entity.usageLimit);

    const remainingUsage = entity.usageLimit 
      ? entity.usageLimit - entity.usedCount 
      : undefined;

    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      value: entity.value,
      minOrderAmount: entity.minOrderAmount,
      maxDiscountAmount: entity.maxDiscountAmount,
      usageLimit: entity.usageLimit,
      usedCount: entity.usedCount,
      userUsageLimit: entity.userUsageLimit,
      startDate: entity.startDate,
      endDate: entity.endDate,
      isActive: entity.isActive,
      targetType: entity.targetType,
      targetIds: entity.targetIds,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      isValid,
      remainingUsage,
    };
  }

  /**
   * Map entity array to PromotionResponseDto array
   * @param entities - Promotion entities
   * @returns Promotion response DTOs
   */
  static toResponseDtoArray(entities: PromotionEntity[]): PromotionResponseDto[] {
    return entities.map(entity => this.toResponseDto(entity));
  }

  /**
   * Map usage entity to PromotionUsageResponseDto
   * @param entity - Promotion usage entity
   * @returns Promotion usage response DTO
   */
  static usageToResponseDto(entity: PromotionUsageEntity): PromotionUsageResponseDto {
    return {
      id: entity.id,
      promotionId: entity.promotionId,
      userId: entity.userId,
      bookingId: entity.bookingId,
      discountAmount: entity.discountAmount,
      originalAmount: entity.originalAmount,
      finalAmount: entity.finalAmount,
      createdAt: entity.createdAt,
    };
  }

  /**
   * Map usage entity array to PromotionUsageResponseDto array
   * @param entities - Promotion usage entities
   * @returns Promotion usage response DTOs
   */
  static usageToResponseDtoArray(entities: PromotionUsageEntity[]): PromotionUsageResponseDto[] {
    return entities.map(entity => this.usageToResponseDto(entity));
  }

  /**
   * Map entity to simplified promotion object for validation response
   * @param entity - Promotion entity
   * @returns Simplified promotion object
   */
  static toValidationPromotion(entity: PromotionEntity): {
    id: string;
    code: string;
    name: string;
    type: PromotionType;
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
  } {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      type: entity.type,
      value: entity.value,
      minOrderAmount: entity.minOrderAmount,
      maxDiscountAmount: entity.maxDiscountAmount,
    };
  }

  /**
   * Calculate promotion validity
   * @param entity - Promotion entity
   * @returns boolean
   */
  static isPromotionValid(entity: PromotionEntity): boolean {
    const now = new Date();
    return entity.isActive &&
      entity.startDate <= now &&
      (!entity.endDate || entity.endDate >= now) &&
      (!entity.usageLimit || entity.usedCount < entity.usageLimit);
  }

  /**
   * Calculate remaining usage for a promotion
   * @param entity - Promotion entity
   * @returns number | undefined
   */
  static getRemainingUsage(entity: PromotionEntity): number | undefined {
    return entity.usageLimit ? entity.usageLimit - entity.usedCount : undefined;
  }

  /**
   * Check if promotion is expired
   * @param entity - Promotion entity
   * @returns boolean
   */
  static isExpired(entity: PromotionEntity): boolean {
    const now = new Date();
    return entity.endDate ? entity.endDate < now : false;
  }

  /**
   * Check if promotion has started
   * @param entity - Promotion entity
   * @returns boolean
   */
  static hasStarted(entity: PromotionEntity): boolean {
    const now = new Date();
    return entity.startDate <= now;
  }

  /**
   * Check if promotion usage limit is reached
   * @param entity - Promotion entity
   * @returns boolean
   */
  static isUsageLimitReached(entity: PromotionEntity): boolean {
    return entity.usageLimit ? entity.usedCount >= entity.usageLimit : false;
  }

  /**
   * Get promotion status
   * @param entity - Promotion entity
   * @returns string
   */
  static getPromotionStatus(entity: PromotionEntity): string {
    if (!entity.isActive) return 'INACTIVE';
    if (this.isExpired(entity)) return 'EXPIRED';
    if (!this.hasStarted(entity)) return 'NOT_STARTED';
    if (this.isUsageLimitReached(entity)) return 'LIMIT_REACHED';
    return 'ACTIVE';
  }

  /**
   * Map promotion type to display string
   * @param type - Promotion type
   * @returns string
   */
  static getPromotionTypeDisplay(type: PromotionType): string {
    switch (type) {
      case PromotionType.PERCENTAGE:
        return 'Percentage Discount';
      case PromotionType.FIXED_AMOUNT:
        return 'Fixed Amount Discount';
      case PromotionType.FREE_SHIPPING:
        return 'Free Shipping';
      case PromotionType.BUY_X_GET_Y:
        return 'Buy X Get Y';
      default:
        return 'Unknown';
    }
  }

  /**
   * Map promotion target to display string
   * @param target - Promotion target
   * @returns string
   */
  static getPromotionTargetDisplay(target: PromotionTarget): string {
    switch (target) {
      case PromotionTarget.ALL:
        return 'All Users';
      case PromotionTarget.USER:
        return 'Specific Users';
      case PromotionTarget.SERVICE:
        return 'Specific Services';
      case PromotionTarget.PARTNER:
        return 'Specific Partners';
      case PromotionTarget.CATEGORY:
        return 'Service Categories';
      default:
        return 'Unknown';
    }
  }
}
