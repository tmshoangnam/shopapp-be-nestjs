import { IsString, IsEmail, IsOptional, IsEnum, IsUrl, IsDecimal, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '@prisma/client';

export class CreatePartnerDto {
  @ApiProperty({
    description: 'Partner name',
    example: 'Beauty Salon ABC',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Partner description',
    example: 'Professional beauty services for all your needs',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Partner email address',
    example: 'contact@beautysalon.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Partner phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Partner address',
    example: '123 Main Street, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Partner website URL',
    example: 'https://www.beautysalon.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Partner logo URL',
    example: 'https://www.beautysalon.com/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Partner status',
    enum: PartnerStatus,
    default: PartnerStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus = PartnerStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Commission rate percentage',
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(100)
  commissionRate?: number;
}