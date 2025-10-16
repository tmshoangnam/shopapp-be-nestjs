import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, CancelBookingDto } from './dto';

type PaginatedResult<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService, private readonly bookingsRepository: BookingsRepository) {}

  async create(createBookingDto: CreateBookingDto) {
    // Validate booking dates
    this.validateBookingDates(createBookingDto);

    // Check availability
    const isAvailable = await this.checkAvailability(
      createBookingDto.serviceId,
      new Date(createBookingDto.startTime),
      new Date(createBookingDto.endTime),
    );

    if (!isAvailable) {
      throw new ConflictException('Time slot is not available for booking');
    }

    // Validate amounts
    this.validateAmounts(createBookingDto);

    return this.bookingsRepository.create(createBookingDto);
  }

  async findById(id: string) {
    const booking = await this.bookingsRepository.findById(id);
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    
    return booking;
  }

  async findByUserId(userId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.bookingsRepository.findByUserId(userId, options);
  }

  async findByServiceId(serviceId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.bookingsRepository.findByServiceId(serviceId, options);
  }

  async findByPartnerId(partnerId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.bookingsRepository.findByPartnerId(partnerId, options);
  }

  async findAll(options: QueryBookingDto = {}): Promise<PaginatedResult<any>> {
    return this.bookingsRepository.findAll(options);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const existingBooking = await this.findById(id);
    
    // Check if booking can be updated
    this.validateBookingUpdate(existingBooking, updateBookingDto);

    // If updating time, check availability
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : existingBooking.startTime;
      const endTime = updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : existingBooking.endTime;
      
      const isAvailable = await this.checkAvailability(
        existingBooking.serviceId,
        startTime,
        endTime,
        id,
      );

      if (!isAvailable) {
        throw new ConflictException('Time slot is not available for booking');
      }
    }

    // If updating amounts, validate them
    if (updateBookingDto.totalAmount || updateBookingDto.discountAmount || updateBookingDto.finalAmount) {
      this.validateUpdatedAmounts({
        ...existingBooking,
        ...updateBookingDto,
      });
    }

    return this.bookingsRepository.update(id, updateBookingDto);
  }

  async cancel(id: string, cancelBookingDto: CancelBookingDto) {
    const existingBooking = await this.findById(id);
    
    // Check if booking can be cancelled
    this.validateBookingCancellation(existingBooking);

    return this.bookingsRepository.update(id, { status: 'CANCELLED', cancellationReason: cancelBookingDto.cancellationReason } as any);
  }

  async delete(id: string): Promise<void> {
    const existingBooking = await this.findById(id);
    
    // Check if booking can be deleted
    this.validateBookingDeletion(existingBooking);

    await this.bookingsRepository.delete(id);
  }

  async confirm(id: string) {
    const existingBooking = await this.findById(id);
    
    if (existingBooking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    return this.bookingsRepository.update(id, { status: 'CONFIRMED' } as any);
  }

  async complete(id: string) {
    const existingBooking = await this.findById(id);
    
    if (existingBooking.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Only in-progress bookings can be completed');
    }

    return this.bookingsRepository.update(id, { status: 'COMPLETED' } as any);
  }

  async getStatistics(partnerId?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const where = partnerId ? { partnerId } : ({} as any);
    const [total, pending, confirmed, completed, cancelled, completedBookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.bookingsRepository.countByStatus('PENDING'),
      this.bookingsRepository.countByStatus('CONFIRMED'),
      this.bookingsRepository.countByStatus('COMPLETED'),
      this.bookingsRepository.countByStatus('CANCELLED'),
      this.prisma.booking.findMany({ where: { ...where, status: 'COMPLETED' as any }, select: { finalAmount: true } }),
    ]);

    const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.finalAmount), 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
    };
  }

  async checkAvailability(serviceId: string, startTime: Date, endTime: Date, excludeBookingId?: string): Promise<boolean> {
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        serviceId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] as any },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
      select: { id: true },
    });
    return !overlapping;
  }

  private validateBookingDates(createBookingDto: CreateBookingDto): void {
    const bookingDate = new Date(createBookingDto.bookingDate);
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);
    const now = new Date();

    // Check if booking date is in the past
    if (bookingDate < now) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // Check if start time is in the past
    if (startTime < now) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if booking date matches start time date
    if (bookingDate.toDateString() !== startTime.toDateString()) {
      throw new BadRequestException('Booking date must match start time date');
    }
  }

  private validateAmounts(createBookingDto: CreateBookingDto): void {
    const { totalAmount, discountAmount = 0, finalAmount } = createBookingDto;

    if (totalAmount <= 0) {
      throw new BadRequestException('Total amount must be positive');
    }

    if (discountAmount < 0) {
      throw new BadRequestException('Discount amount cannot be negative');
    }

    if (discountAmount > totalAmount) {
      throw new BadRequestException('Discount amount cannot exceed total amount');
    }

    if (finalAmount !== totalAmount - discountAmount) {
      throw new BadRequestException('Final amount must equal total amount minus discount amount');
    }

    if (finalAmount <= 0) {
      throw new BadRequestException('Final amount must be positive');
    }
  }

  private validateUpdatedAmounts(bookingData: any): void {
    const { totalAmount, discountAmount = 0, finalAmount } = bookingData;

    if (totalAmount <= 0) {
      throw new BadRequestException('Total amount must be positive');
    }

    if (discountAmount < 0) {
      throw new BadRequestException('Discount amount cannot be negative');
    }

    if (discountAmount > totalAmount) {
      throw new BadRequestException('Discount amount cannot exceed total amount');
    }

    if (finalAmount !== totalAmount - discountAmount) {
      throw new BadRequestException('Final amount must equal total amount minus discount amount');
    }

    if (finalAmount <= 0) {
      throw new BadRequestException('Final amount must be positive');
    }
  }

  private validateBookingUpdate(existingBooking: any, updateBookingDto: UpdateBookingDto): void {
    // Cannot update cancelled or completed bookings
    if (existingBooking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update cancelled booking');
    }

    if (existingBooking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot update completed booking');
    }

    // Cannot update if payment is completed and trying to change amounts
    if (existingBooking.paymentStatus === 'COMPLETED') {
      if (updateBookingDto.totalAmount || updateBookingDto.discountAmount || updateBookingDto.finalAmount) {
        throw new BadRequestException('Cannot update amounts for paid booking');
      }
    }
  }

  private validateBookingCancellation(existingBooking: any): void {
    // Cannot cancel already cancelled booking
    if (existingBooking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Cannot cancel completed booking
    if (existingBooking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // Cannot cancel if payment is completed (need refund process)
    if (existingBooking.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel paid booking. Please contact support for refund.');
    }
  }

  private validateBookingDeletion(existingBooking: any): void {
    // Cannot delete if payment is completed
    if (existingBooking.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot delete paid booking');
    }

    // Cannot delete if booking is in progress
    if (existingBooking.status === 'IN_PROGRESS') {
      throw new BadRequestException('Cannot delete in-progress booking');
    }
  }

  private defaultInclude() {
    return {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      service: { select: { id: true, name: true, description: true, category: true, duration: true, price: true, image: true } },
      partner: { select: { id: true, name: true, email: true, phone: true, address: true } },
      payments: { select: { id: true, amount: true, currency: true, method: true, status: true, transactionId: true, gateway: true, createdAt: true } },
    } as const;
  }

  private buildWhereClause(options: QueryBookingDto) {
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
    if (options.userId) where.userId = options.userId;
    if (options.serviceId) where.serviceId = options.serviceId;
    if (options.partnerId) where.partnerId = options.partnerId;
    if (options.staffId) where.staffId = options.staffId;
    if (options.status) where.status = options.status as any;
    if (options.paymentStatus) where.paymentStatus = options.paymentStatus as any;
    if (options.startDate && options.endDate) {
      where.bookingDate = { gte: new Date(options.startDate), lte: new Date(options.endDate) };
    }
    return where;
  }

  private toUpdateData(updateBookingDto: UpdateBookingDto) {
    const data: any = {};
    if (updateBookingDto.partnerId !== undefined) data.partnerId = updateBookingDto.partnerId;
    if (updateBookingDto.staffId !== undefined) data.staffId = updateBookingDto.staffId;
    if (updateBookingDto.bookingDate !== undefined) data.bookingDate = new Date(updateBookingDto.bookingDate);
    if (updateBookingDto.startTime !== undefined) data.startTime = new Date(updateBookingDto.startTime);
    if (updateBookingDto.endTime !== undefined) data.endTime = new Date(updateBookingDto.endTime);
    if (updateBookingDto.status !== undefined) data.status = updateBookingDto.status as any;
    if (updateBookingDto.totalAmount !== undefined) data.totalAmount = updateBookingDto.totalAmount;
    if (updateBookingDto.discountAmount !== undefined) data.discountAmount = updateBookingDto.discountAmount;
    if (updateBookingDto.finalAmount !== undefined) data.finalAmount = updateBookingDto.finalAmount;
    if (updateBookingDto.paymentStatus !== undefined) data.paymentStatus = updateBookingDto.paymentStatus as any;
    if (updateBookingDto.paymentMethod !== undefined) data.paymentMethod = updateBookingDto.paymentMethod;
    if (updateBookingDto.notes !== undefined) data.notes = updateBookingDto.notes;
    if (updateBookingDto.cancellationReason !== undefined) data.cancellationReason = updateBookingDto.cancellationReason;
    return data;
  }
}
