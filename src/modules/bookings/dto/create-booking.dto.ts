import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({
    description: 'User ID who is making the booking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Service ID to be booked',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty({ message: 'Service ID is required' })
  @IsUUID('4', { message: 'Service ID must be a valid UUID' })
  serviceId: string;

  @ApiProperty({
    description: 'Partner ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Partner ID must be a valid UUID' })
  partnerId?: string;

  @ApiProperty({
    description: 'Staff ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Staff ID must be a valid UUID' })
  staffId?: string;

  @ApiProperty({
    description: 'Booking date',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Booking date is required' })
  @IsDateString({}, { message: 'Booking date must be a valid ISO date string' })
  bookingDate: string;

  @ApiProperty({
    description: 'Service start time',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  startTime: string;

  @ApiProperty({
    description: 'Service end time',
    example: '2024-01-15T11:00:00.000Z',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString({}, { message: 'End time must be a valid ISO date string' })
  endTime: string;

  @ApiProperty({
    description: 'Total amount for the booking',
    example: 150000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Total amount is required' })
  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be positive' })
  @Type(() => Number)
  totalAmount: number;

  @ApiProperty({
    description: 'Discount amount (optional)',
    example: 15000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Discount amount must be a number' })
  @Min(0, { message: 'Discount amount cannot be negative' })
  @Type(() => Number)
  discountAmount?: number;

  @ApiProperty({
    description: 'Final amount after discount',
    example: 135000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Final amount is required' })
  @IsNumber({}, { message: 'Final amount must be a number' })
  @IsPositive({ message: 'Final amount must be positive' })
  @Type(() => Number)
  finalAmount: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'card',
    enum: ['cash', 'card', 'bank_transfer', 'wallet'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Payment method must be a string' })
  paymentMethod?: string;

  @ApiProperty({
    description: 'Additional notes for the booking',
    example: 'Please call before arrival',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
