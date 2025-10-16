import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  countUsers(where: any = {}) { return this.prisma.user.count({ where }); }
  countPartners(where: any = {}) { return this.prisma.partner.count({ where }); }
  countServices(where: any = {}) { return this.prisma.service.count({ where }); }
  countAppointments(where: any = {}) { return this.prisma.appointment.count({ where }); }
  averageReviewRating() { return this.prisma.review.aggregate({ _avg: { rating: true } }); }
  queryRaw<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> { return this.prisma.$queryRaw(strings, ...values) as any; }
  transaction<T>(fn: (tx: PrismaService) => Promise<T>) { return this.prisma.$transaction((tx) => fn((tx as unknown) as PrismaService)); }
}

