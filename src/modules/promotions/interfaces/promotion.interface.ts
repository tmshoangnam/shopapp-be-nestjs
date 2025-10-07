import { PromotionType, PromotionTarget } from '@prisma/client';
import { PromotionEntity, PromotionUsageEntity, PromotionStatsEntity } from '../entities/promotion.entity';

/**
 * Interface for Promotion Service operations
 * @interface IPromotionService
 */
export interface IPromotionService {
  create(createPromotionDto: CreatePromotionDto): Promise<PromotionEntity>;
  findAll(options?: FindAllPromotionsOptions): Promise<PaginatedResult<PromotionEntity>>;
  findById(id: string): Promise<PromotionEntity>;
  findByCode(code: string): Promise<PromotionEntity>;
  update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<PromotionEntity>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<PromotionEntity>;
  deactivate(id: string): Promise<PromotionEntity>;
  
  // Business logic methods
  validatePromotion(code: string, userId: string, orderAmount: number): Promise<ValidationResult>;
  applyPromotion(code: string, userId: string, bookingId: string, orderAmount: number): Promise<PromotionApplicationResult>;
  getPromotionStats(promotionId: string): Promise<PromotionStatsEntity>;
  getAvailablePromotions(userId: string, orderAmount?: number): Promise<PromotionEntity[]>;
}

/**
 * Interface for Promotion Repository operations
 * @interface IPromotionRepository
 */
export interface IPromotionRepository {
  create(data: CreatePromotionDto): Promise<PromotionEntity>;
  findAll(options?: FindAllPromotionsOptions): Promise<PaginatedResult<PromotionEntity>>;
  findById(id: string): Promise<PromotionEntity | null>;
  findByCode(code: string): Promise<PromotionEntity | null>;
  update(id: string, data: UpdatePromotionDto): Promise<PromotionEntity>;
  delete(id: string): Promise<void>;
  findActivePromotions(): Promise<PromotionEntity[]>;
  findPromotionsByTarget(targetType: PromotionTarget, targetIds?: string[]): Promise<PromotionEntity[]>;
  incrementUsageCount(promotionId: string): Promise<void>;
  createUsage(usageData: CreatePromotionUsageDto): Promise<PromotionUsageEntity>;
  getUserUsageCount(promotionId: string, userId: string): Promise<number>;
  getPromotionStats(promotionId: string): Promise<PromotionStatsEntity>;
}

/**
 * DTOs for Promotion operations
 */
export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  startDate: string;
  endDate?: string;
  targetType: PromotionTarget;
  targetIds?: string[];
  createdBy?: string;
}

export interface UpdatePromotionDto {
  name?: string;
  description?: string;
  value?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  targetType?: PromotionTarget;
  targetIds?: string[];
}

export interface CreatePromotionUsageDto {
  promotionId: string;
  userId: string;
  bookingId?: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

/**
 * Options for finding promotions
 */
export interface FindAllPromotionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  targetType?: PromotionTarget;
  type?: PromotionType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Promotion validation result
 */
export interface ValidationResult {
  isValid: boolean;
  promotion?: PromotionEntity;
  discountAmount?: number;
  finalAmount?: number;
  errors?: string[];
}

/**
 * Promotion application result
 */
export interface PromotionApplicationResult {
  success: boolean;
  usage?: PromotionUsageEntity;
  discountAmount: number;
  finalAmount: number;
  errors?: string[];
}
