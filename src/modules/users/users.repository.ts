import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface QueryUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersRepository extends AbstractPrismaRepository<any, any, any, UpdateUserDto, QueryUsersDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.user;
  }

  protected toEntity(record: any) {
    const { password, ...safe } = record;
    return safe;
  }

  protected toCreateData(dto: any) {
    return dto;
  }

  protected toUpdateData(dto: UpdateUserDto) {
    return dto;
  }

  protected defaultInclude() {
    return undefined;
  }

  protected buildWhereClause(options: QueryUsersDto = {}): any {
    const where: any = {};
    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    if (options.role) where.role = options.role;
    if (options.isActive !== undefined) where.isActive = options.isActive;
    return where;
  }
}

