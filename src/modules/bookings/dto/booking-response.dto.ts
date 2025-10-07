import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+84901234567',
  })
  phone: string;
}

export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Hair Cut & Style',
  })
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional hair cutting and styling service',
  })
  description: string;

  @ApiProperty({
    description: 'Service category',
    example: 'Hair Services',
  })
  category: string;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 60,
  })
  duration: number;

  @ApiProperty({
    description: 'Service price',
    example: 150000,
  })
  price: number;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/service-image.jpg',
  })
  image: string;
}

export class PartnerResponseDto {
  @ApiProperty({
    description: 'Partner ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id: string;

  @ApiProperty({
    description: 'Partner name',
    example: 'Beauty Salon ABC',
  })
  name: string;

  @ApiProperty({
    description: 'Partner email',
    example: 'contact@beautysalon.com',
  })
  email: string;

  @ApiProperty({
    description: 'Partner phone',
    example: '+84901234568',
  })
  phone: string;

  @ApiProperty({
    description: 'Partner address',
    example: '123 Main Street, District 1, HCMC',
  })
  address: string;
}

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  id: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 135000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'VND',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'card',
  })
  method: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Transaction ID from payment gateway',
    example: 'txn_123456789',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment gateway used',
    example: 'stripe',
  })
  gateway: string;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;
}

export class BookingResponseDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  id: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Service information',
    type: ServiceResponseDto,
  })
  service: ServiceResponseDto;

  @ApiProperty({
    description: 'Partner information',
    type: PartnerResponseDto,
    required: false,
  })
  partner?: PartnerResponseDto;

  @ApiProperty({
    description: 'Staff ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
  })
  staffId?: string;

  @ApiProperty({
    description: 'Booking date',
    example: '2024-01-15T10:00:00.000Z',
  })
  bookingDate: Date;

  @ApiProperty({
    description: 'Service start time',
    example: '2024-01-15T10:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Service end time',
    example: '2024-01-15T11:00:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @ApiProperty({
    description: 'Total amount',
    example: 150000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 15000,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Final amount after discount',
    example: 135000,
  })
  finalAmount: number;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Payment method',
    example: 'card',
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Please call before arrival',
  })
  notes: string;

  @ApiProperty({
    description: 'Cancellation reason',
    example: 'Customer requested cancellation',
    required: false,
  })
  cancellationReason?: string;

  @ApiProperty({
    description: 'Cancellation date',
    example: '2024-01-14T15:30:00.000Z',
    required: false,
  })
  cancelledAt?: Date;

  @ApiProperty({
    description: 'Booking creation date',
    example: '2024-01-10T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Booking last update date',
    example: '2024-01-12T14:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Payment information',
    type: [PaymentResponseDto],
    required: false,
  })
  payments?: PaymentResponseDto[];
}
