import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '@prisma/client';

export class PartnerResponseDto {
  @ApiProperty({
    description: 'Partner ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Partner name',
    example: 'Beauty Salon ABC',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Partner description',
    example: 'Professional beauty services for all your needs',
  })
  description?: string;

  @ApiProperty({
    description: 'Partner email address',
    example: 'contact@beautysalon.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Partner phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Partner address',
    example: '123 Main Street, City, State 12345',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Partner website URL',
    example: 'https://www.beautysalon.com',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Partner logo URL',
    example: 'https://www.beautysalon.com/logo.png',
  })
  logo?: string;

  @ApiProperty({
    description: 'Partner status',
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
  })
  status: PartnerStatus;

  @ApiPropertyOptional({
    description: 'Commission rate percentage',
    example: 15.5,
  })
  commissionRate?: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Count of related services',
    example: 5,
  })
  _count?: {
    services: number;
    appointments: number;
  };
}