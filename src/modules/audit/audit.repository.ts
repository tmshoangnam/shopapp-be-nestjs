import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(where: any, skip: number, take: number) {
    return this.prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } });
  }

  count(where: any) { return this.prisma.auditLog.count({ where }); }

  groupByUsers(where: any) {
    return this.prisma.auditLog.groupBy({ by: ['userId'], where: { ...where, userId: { not: null } } });
  }

  groupTopActions(where: any) {
    return this.prisma.auditLog.groupBy({ by: ['action'], where, _count: { action: true }, orderBy: { _count: { action: 'desc' } }, take: 10 });
  }
}

