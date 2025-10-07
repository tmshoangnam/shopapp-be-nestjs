import { ApiProperty } from '@nestjs/swagger';
import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Promotion Response Data Transfer Object
 * @class PromotionResponseDto
 */
export class PromotionResponseDto {
  @ApiProperty({
    description: 'Promotion unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique promotion code',
    example: 'SUMMER2024',
  })
  code: string;

  @ApiProperty({
    description: 'Promotion name',
    example: 'Summer Sale 2024',
  })
  name: string;

  @ApiProperty({
    description: 'Promotion description',
    example: 'Get 20% off on all beauty services this summer',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Type of promotion',
    example: PromotionType.PERCENTAGE,
    enum: PromotionType,
  })
  type: PromotionType;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 20,
  })
  value: number;

  @ApiProperty({
    description: 'Minimum order amount to apply promotion',
    example: 500000,
    required: false,
  })
  minOrderAmount?: number;

  @ApiProperty({
    description: 'Maximum discount amount',
    example: 200000,
    required: false,
  })
  maxDiscountAmount?: number;

  @ApiProperty({
    description: 'Total usage limit for the promotion',
    example: 1000,
    required: false,
  })
  usageLimit?: number;

  @ApiProperty({
    description: 'Number of times this promotion has been used',
    example: 150,
  })
  usedCount: number;

  @ApiProperty({
    description: 'Per user usage limit',
    example: 2,
  })
  userUsageLimit: number;

  @ApiProperty({
    description: 'Promotion start date',
    example: '2024-06-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Promotion end date',
    example: '2024-08-31T23:59:59.000Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Promotion active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Promotion target type',
    example: PromotionTarget.ALL,
    enum: PromotionTarget,
  })
  targetType: PromotionTarget;

  @ApiProperty({
    description: 'Array of target IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  targetIds: string[];

  @ApiProperty({
    description: 'Promotion creation timestamp',
    example: '2024-05-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Promotion last update timestamp',
    example: '2024-05-20T14:45:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID of the user who created this promotion',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  createdBy?: string;

  @ApiProperty({
    description: 'Whether the promotion is currently valid and can be used',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Remaining usage count',
    example: 850,
    required: false,
  })
  remainingUsage?: number;
}

/**
 * Promotion Usage Response Data Transfer Object
 * @class PromotionUsageResponseDto
 */
export class PromotionUsageResponseDto {
  @ApiProperty({
    description: 'Usage unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Promotion ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  promotionId: string;

  @ApiProperty({
    description: 'User ID who used the promotion',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;

  @ApiProperty({
    description: 'Booking ID associated with this usage',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
  })
  bookingId?: string;

  @ApiProperty({
    description: 'Discount amount applied',
    example: 50000,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Original order amount',
    example: 300000,
  })
  originalAmount: number;

  @ApiProperty({
    description: 'Final amount after discount',
    example: 250000,
  })
  finalAmount: number;

  @ApiProperty({
    description: 'Usage timestamp',
    example: '2024-06-15T14:30:00.000Z',
  })
  createdAt: Date;
}

/**
 * Promotion Statistics Response Data Transfer Object
 * @class PromotionStatsResponseDto
 */
export class PromotionStatsResponseDto {
  @ApiProperty({
    description: 'Promotion ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  promotionId: string;

  @ApiProperty({
    description: 'Total number of times this promotion has been used',
    example: 150,
  })
  totalUsage: number;

  @ApiProperty({
    description: 'Total discount amount given',
    example: 7500000,
  })
  totalDiscountGiven: number;

  @ApiProperty({
    description: 'Total revenue generated from this promotion',
    example: 45000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Number of unique users who used this promotion',
    example: 120,
  })
  uniqueUsers: number;

  @ApiProperty({
    description: 'Conversion rate percentage',
    example: 15.5,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Average order value',
    example: 300000,
  })
  averageOrderValue: number;
}

/**
 * Paginated Promotion Response Data Transfer Object
 * @class PaginatedPromotionResponseDto
 */
export class PaginatedPromotionResponseDto {
  @ApiProperty({
    description: 'Array of promotions',
    type: [PromotionResponseDto],
  })
  data: PromotionResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 10,
      total: 50,
      totalPages: 5,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
