import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';

export interface CreateServiceDto {
  name: string;
  description?: string;
  category?: string;
  duration: number;
  price: number;
  image?: string;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface ServiceFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

@Injectable()
export class ServicesRepository extends AbstractPrismaRepository<any, any, CreateServiceDto, UpdateServiceDto, ServiceFilterDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.service;
  }

  protected toEntity(record: any) {
    return { ...record, price: Number(record.price) };
  }

  protected toCreateData(dto: CreateServiceDto) {
    return dto;
  }

  protected toUpdateData(dto: UpdateServiceDto) {
    return dto;
  }

  protected buildWhereClause(filter: ServiceFilterDto = {}): any {
    const where: any = {};
    const { search, category, minPrice, maxPrice, isActive } = filter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (isActive !== undefined) where.isActive = isActive;
    return where;
  }
}

