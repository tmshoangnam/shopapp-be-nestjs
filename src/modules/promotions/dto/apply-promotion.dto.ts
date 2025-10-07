import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Apply Promotion Data Transfer Object
 * @class ApplyPromotionDto
 */
export class ApplyPromotionDto {
  @ApiProperty({
    description: 'Promotion code to apply',
    example: 'SUMMER2024',
  })
  @IsNotEmpty({ message: 'Promotion code is required' })
  @IsString({ message: 'Promotion code must be a string' })
  code: string;

  @ApiProperty({
    description: 'User ID applying the promotion',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Order amount before discount',
    example: 300000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Order amount is required' })
  @IsNumber({}, { message: 'Order amount must be a number' })
  @Min(0, { message: 'Order amount cannot be negative' })
  @Type(() => Number)
  orderAmount: number;

  @ApiProperty({
    description: 'Booking ID associated with this promotion usage',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Booking ID must be a valid UUID' })
  bookingId?: string;
}

/**
 * Validate Promotion Data Transfer Object
 * @class ValidatePromotionDto
 */
export class ValidatePromotionDto {
  @ApiProperty({
    description: 'Promotion code to validate',
    example: 'SUMMER2024',
  })
  @IsNotEmpty({ message: 'Promotion code is required' })
  @IsString({ message: 'Promotion code must be a string' })
  code: string;

  @ApiProperty({
    description: 'User ID validating the promotion',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Order amount to validate against',
    example: 300000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Order amount is required' })
  @IsNumber({}, { message: 'Order amount must be a number' })
  @Min(0, { message: 'Order amount cannot be negative' })
  @Type(() => Number)
  orderAmount: number;
}

/**
 * Promotion Validation Response Data Transfer Object
 * @class PromotionValidationResponseDto
 */
export class PromotionValidationResponseDto {
  @ApiProperty({
    description: 'Whether the promotion is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Promotion details if valid',
    required: false,
  })
  promotion?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
  };

  @ApiProperty({
    description: 'Calculated discount amount',
    example: 60000,
    required: false,
  })
  discountAmount?: number;

  @ApiProperty({
    description: 'Final amount after applying discount',
    example: 240000,
    required: false,
  })
  finalAmount?: number;

  @ApiProperty({
    description: 'Validation errors if any',
    example: ['Promotion has expired', 'Minimum order amount not met'],
    required: false,
    type: [String],
  })
  errors?: string[];
}

/**
 * Available Promotions Query Data Transfer Object
 * @class AvailablePromotionsDto
 */
export class AvailablePromotionsDto {
  @ApiProperty({
    description: 'User ID to check available promotions for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Order amount to filter relevant promotions',
    example: 300000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Order amount must be a number' })
  @Min(0, { message: 'Order amount cannot be negative' })
  @Type(() => Number)
  orderAmount?: number;
}
