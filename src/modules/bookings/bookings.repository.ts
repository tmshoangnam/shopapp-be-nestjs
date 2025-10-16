import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';
import { PaginatedResult } from '../common/repository/base-repository.interface';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';

@Injectable()
export class BookingsRepository extends AbstractPrismaRepository<any, any, CreateBookingDto, UpdateBookingDto, QueryBookingDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.booking;
  }

  protected toEntity(record: any) {
    // Return raw Prisma record as entity to keep it simple
    return {
      ...record,
      totalAmount: Number(record.totalAmount),
      discountAmount: record.discountAmount != null ? Number(record.discountAmount) : 0,
      finalAmount: Number(record.finalAmount),
    };
  }

  protected toCreateData(dto: CreateBookingDto) {
    return {
      userId: dto.userId,
      serviceId: dto.serviceId,
      partnerId: dto.partnerId,
      staffId: dto.staffId,
      bookingDate: new Date(dto.bookingDate),
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      totalAmount: dto.totalAmount,
      discountAmount: dto.discountAmount || 0,
      finalAmount: dto.finalAmount,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
    };
  }

  protected toUpdateData(dto: UpdateBookingDto) {
    const data: any = {};
    if (dto.partnerId !== undefined) data.partnerId = dto.partnerId;
    if (dto.staffId !== undefined) data.staffId = dto.staffId;
    if (dto.bookingDate !== undefined) data.bookingDate = new Date(dto.bookingDate);
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.status !== undefined) data.status = dto.status as any;
    if (dto.totalAmount !== undefined) data.totalAmount = dto.totalAmount;
    if (dto.discountAmount !== undefined) data.discountAmount = dto.discountAmount;
    if (dto.finalAmount !== undefined) data.finalAmount = dto.finalAmount;
    if (dto.paymentStatus !== undefined) data.paymentStatus = dto.paymentStatus as any;
    if (dto.paymentMethod !== undefined) data.paymentMethod = dto.paymentMethod;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.cancellationReason !== undefined) data.cancellationReason = dto.cancellationReason;
    return data;
  }

  protected defaultInclude() {
    return {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      service: { select: { id: true, name: true, description: true, category: true, duration: true, price: true, image: true } },
      partner: { select: { id: true, name: true, email: true, phone: true, address: true } },
      payments: { select: { id: true, amount: true, currency: true, method: true, status: true, transactionId: true, gateway: true, createdAt: true } },
    } as const;
  }

  protected buildWhereClause(options: QueryBookingDto = {} as QueryBookingDto) {
    const where: any = {};
    if (options.search) {
      where.OR = [
        { user: { OR: [
          { firstName: { contains: options.search, mode: 'insensitive' } },
          { lastName: { contains: options.search, mode: 'insensitive' } },
          { email: { contains: options.search, mode: 'insensitive' } },
        ] } },
        { service: { OR: [
          { name: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } },
        ] } },
        { partner: { name: { contains: options.search, mode: 'insensitive' } } },
      ];
    }
    if ((options as any).userId) where.userId = (options as any).userId;
    if ((options as any).serviceId) where.serviceId = (options as any).serviceId;
    if ((options as any).partnerId) where.partnerId = (options as any).partnerId;
    if ((options as any).staffId) where.staffId = (options as any).staffId;
    if ((options as any).status) where.status = (options as any).status as any;
    if ((options as any).paymentStatus) where.paymentStatus = (options as any).paymentStatus as any;
    if ((options as any).startDate && (options as any).endDate) {
      where.bookingDate = { gte: new Date((options as any).startDate), lte: new Date((options as any).endDate) };
    }
    return where;
  }

  async findByUserId(userId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.findAll({ ...options, userId });
  }

  async findByServiceId(serviceId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.findAll({ ...options, serviceId });
  }

  async findByPartnerId(partnerId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.findAll({ ...options, partnerId });
  }

  async countByStatus(status: string) {
    return this.prisma.booking.count({ where: { status: status as any } });
  }
}

