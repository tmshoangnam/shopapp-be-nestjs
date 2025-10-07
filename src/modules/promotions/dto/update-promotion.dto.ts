import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsPositive,
  Length,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionType, PromotionTarget } from '@prisma/client';

/**
 * Update Promotion Data Transfer Object
 * @class UpdatePromotionDto
 */
export class UpdatePromotionDto {
  @ApiProperty({
    description: 'Promotion name',
    example: 'Summer Sale 2024 - Updated',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Promotion name must be a string' })
  @Length(2, 200, { message: 'Promotion name must be between 2 and 200 characters' })
  name?: string;

  @ApiProperty({
    description: 'Promotion description',
    example: 'Get 25% off on all beauty services this summer',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Promotion description must be a string' })
  @Length(0, 1000, { message: 'Promotion description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Discount value (percentage or fixed amount)',
    example: 25,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Promotion value must be a number' })
  @IsPositive({ message: 'Promotion value must be positive' })
  @Type(() => Number)
  value?: number;

  @ApiProperty({
    description: 'Minimum order amount to apply promotion',
    example: 300000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum order amount must be a number' })
  @Min(0, { message: 'Minimum order amount cannot be negative' })
  @Type(() => Number)
  minOrderAmount?: number;

  @ApiProperty({
    description: 'Maximum discount amount',
    example: 300000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum discount amount must be a number' })
  @Min(0, { message: 'Maximum discount amount cannot be negative' })
  @Type(() => Number)
  maxDiscountAmount?: number;

  @ApiProperty({
    description: 'Total usage limit for the promotion',
    example: 1500,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Usage limit must be a number' })
  @IsPositive({ message: 'Usage limit must be positive' })
  @Type(() => Number)
  usageLimit?: number;

  @ApiProperty({
    description: 'Per user usage limit',
    example: 3,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'User usage limit must be a number' })
  @Min(1, { message: 'User usage limit must be at least 1' })
  @Max(10, { message: 'User usage limit cannot exceed 10' })
  @Type(() => Number)
  userUsageLimit?: number;

  @ApiProperty({
    description: 'Promotion start date',
    example: '2024-06-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiProperty({
    description: 'Promotion end date',
    example: '2024-09-30T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @ValidateIf((o) => o.endDate !== null && o.endDate !== undefined)
  endDate?: string;

  @ApiProperty({
    description: 'Promotion active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Promotion target type',
    example: PromotionTarget.SERVICE,
    enum: PromotionTarget,
    required: false,
  })
  @IsOptional()
  @IsEnum(PromotionTarget, { message: 'Invalid promotion target type' })
  targetType?: PromotionTarget;

  @ApiProperty({
    description: 'Array of target IDs (users, services, partners, etc.)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Target IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each target ID must be a valid UUID' })
  @ArrayNotEmpty({ message: 'Target IDs array cannot be empty if provided' })
  targetIds?: string[];
}
