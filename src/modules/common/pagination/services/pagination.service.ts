import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginationOptions, PaginationMeta, PaginatedResponse } from '../interfaces/pagination.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaginationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create pagination meta information
   */
  createMeta(options: PaginationOptions, total: number): PaginationMeta {
    const { page = 1, limit = 10 } = options;
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get pagination parameters for Prisma queries
   */
  getPaginationParams(options: PaginationOptions) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    return {
      skip,
      take: limit,
      orderBy,
    };
  }

  /**
   * Generic pagination method for any Prisma model
   */
  async paginate<T>(
    modelName: string,
    options: PaginationOptions,
    where?: any,
    include?: any,
    select?: any,
  ): Promise<PaginatedResponse<T>> {
    const { skip, take, orderBy } = this.getPaginationParams(options);

    const [data, total] = await Promise.all([
      (this.prisma as any)[modelName].findMany({
        where,
        include,
        select,
        skip,
        take,
        orderBy,
      }),
      (this.prisma as any)[modelName].count({ where }),
    ]);

    const meta = this.createMeta(options, total);

    return {
      data,
      meta,
    };
  }

  /**
   * Paginate with search functionality
   */
  async paginateWithSearch<T>(
    modelName: string,
    options: PaginationOptions & { search?: string },
    searchFields: string[],
    where?: any,
    include?: any,
    select?: any,
  ): Promise<PaginatedResponse<T>> {
    const { search, ...paginationOptions } = options;

    // Build search condition
    const searchCondition = search
      ? {
          OR: searchFields.map((field) => ({
            [field]: {
              contains: search,
              mode: 'insensitive' as const,
            },
          })),
        }
      : {};

    // Combine search with existing where conditions
    const finalWhere = where
      ? {
          AND: [where, searchCondition],
        }
      : searchCondition;

    return this.paginate<T>(
      modelName,
      paginationOptions,
      finalWhere,
      include,
      select,
    );
  }

  /**
   * Paginate with custom query builder
   */
  async paginateWithQuery<T>(
    queryBuilder: (skip: number, take: number, orderBy: any) => Promise<T[]>,
    countQueryBuilder: () => Promise<number>,
    options: PaginationOptions,
  ): Promise<PaginatedResponse<T>> {
    const { skip, take, orderBy } = this.getPaginationParams(options);

    const [data, total] = await Promise.all([
      queryBuilder(skip, take, orderBy),
      countQueryBuilder(),
    ]);

    const meta = this.createMeta(options, total);

    return {
      data,
      meta,
    };
  }

  /**
   * Paginate with raw SQL query
   */
  async paginateWithRawQuery<T>(
    query: string,
    countQuery: string,
    params: any[],
    options: PaginationOptions,
  ): Promise<PaginatedResponse<T>> {
    const { skip, take } = this.getPaginationParams(options);
    const { sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const paginatedQuery = `
      ${query}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${take} OFFSET ${skip}
    `;

    const [data, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<T[]>(paginatedQuery, ...params),
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(countQuery, ...params),
    ]);

    const total = Number(countResult[0].count);
    const meta = this.createMeta(options, total);

    return {
      data,
      meta,
    };
  }

  /**
   * Get cursor-based pagination (useful for real-time data)
   */
  async paginateWithCursor<T>(
    modelName: string,
    options: {
      cursor?: string;
      take: number;
      orderBy: any;
    },
    where?: any,
    include?: any,
    select?: any,
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const { cursor, take, orderBy } = options;

    const data = await (this.prisma as any)[modelName].findMany({
      where: cursor
        ? {
            ...where,
            id: {
              gt: cursor,
            },
          }
        : where,
      include,
      select,
      take: take + 1, // Take one extra to check if there's more
      orderBy,
    });

    const hasMore = data.length > take;
    const items = hasMore ? data.slice(0, take) : data;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return {
      data: items,
      nextCursor,
      hasMore,
    };
  }
}
