import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Promotion entity representing a promotional campaign
 * @class PromotionEntity
 */
export class PromotionEntity {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  userUsageLimit: number;
  
  // Time constraints
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  
  // Target constraints
  targetType: PromotionTarget;
  targetIds: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;

  // Relations
  usages?: PromotionUsageEntity[];
}

/**
 * Promotion usage entity representing usage tracking
 * @class PromotionUsageEntity
 */
export class PromotionUsageEntity {
  id: string;
  promotionId: string;
  userId: string;
  bookingId?: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  createdAt: Date;

  // Relations
  promotion?: PromotionEntity;
}

/**
 * Promotion statistics entity for analytics
 * @class PromotionStatsEntity
 */
export class PromotionStatsEntity {
  promotionId: string;
  totalUsage: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  uniqueUsers: number;
  conversionRate: number;
  averageOrderValue: number;
}
