import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';
import { ReviewFilterDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsRepository extends AbstractPrismaRepository<any, any, any, any, ReviewFilterDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.review;
  }

  protected toEntity(record: any) {
    return record;
  }

  protected toCreateData(dto: any) {
    return dto as any;
  }

  protected toUpdateData(dto: any) {
    return dto as any;
  }

  protected defaultInclude() {
    return {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      service: { select: { id: true, name: true, image: true } },
    } as const;
  }

  protected buildWhereClause(filter: ReviewFilterDto = {}): any {
    const where: any = {};
    if (filter.serviceId) where.serviceId = filter.serviceId;
    if (filter.userId) where.userId = filter.userId;
    if (filter.minRating !== undefined) where.rating = { gte: filter.minRating };
    return where;
  }
}

