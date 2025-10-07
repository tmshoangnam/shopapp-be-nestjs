import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsRepository } from './bookings.repository';
import { BookingEntity } from './entities';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, CancelBookingDto } from './dto';
import { IBookingService, PaginatedResult } from './interfaces';
// BookingStatus and PaymentStatus enums will be imported from Prisma client after generation

@Injectable()
export class BookingsService implements IBookingService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingEntity> {
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

  async findById(id: string): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findById(id);
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    
    return booking;
  }

  async findByUserId(userId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>> {
    return this.bookingsRepository.findByUserId(userId, options);
  }

  async findByServiceId(serviceId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>> {
    return this.bookingsRepository.findByServiceId(serviceId, options);
  }

  async findByPartnerId(partnerId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>> {
    return this.bookingsRepository.findByPartnerId(partnerId, options);
  }

  async findAll(options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>> {
    return this.bookingsRepository.findAll(options);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity> {
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

  async cancel(id: string, cancelBookingDto: CancelBookingDto): Promise<BookingEntity> {
    const existingBooking = await this.findById(id);
    
    // Check if booking can be cancelled
    this.validateBookingCancellation(existingBooking);

    return this.bookingsRepository.cancel(id, cancelBookingDto.cancellationReason);
  }

  async delete(id: string): Promise<void> {
    const existingBooking = await this.findById(id);
    
    // Check if booking can be deleted
    this.validateBookingDeletion(existingBooking);

    return this.bookingsRepository.delete(id);
  }

  async confirm(id: string): Promise<BookingEntity> {
    const existingBooking = await this.findById(id);
    
    if (existingBooking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    return this.bookingsRepository.update(id, { status: 'CONFIRMED' });
  }

  async complete(id: string): Promise<BookingEntity> {
    const existingBooking = await this.findById(id);
    
    if (existingBooking.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Only in-progress bookings can be completed');
    }

    return this.bookingsRepository.update(id, { status: 'COMPLETED' });
  }

  async getStatistics(partnerId?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const where = partnerId ? { partnerId } : {};
    
    const [total, pending, confirmed, completed, cancelled, revenueData] = await Promise.all([
      this.bookingsRepository.countByStatus(''),
      this.bookingsRepository.countByStatus('PENDING'),
      this.bookingsRepository.countByStatus('CONFIRMED'),
      this.bookingsRepository.countByStatus('COMPLETED'),
      this.bookingsRepository.countByStatus('CANCELLED'),
      this.bookingsRepository.findAll({ 
        ...where,
        status: 'COMPLETED',
        limit: 1000, // Get all completed bookings for revenue calculation
      }),
    ]);

    const totalRevenue = revenueData.data.reduce((sum, booking) => sum + booking.finalAmount, 0);

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
    const where: any = {
      serviceId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    };

    if (excludeBookingId) {
      where.id = { not: excludeBookingId };
    }

    const conflictingBookings = await this.bookingsRepository.findAll({
      serviceId,
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString(),
    });

    return conflictingBookings.data.length === 0;
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

  private validateBookingUpdate(existingBooking: BookingEntity, updateBookingDto: UpdateBookingDto): void {
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

  private validateBookingCancellation(existingBooking: BookingEntity): void {
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

  private validateBookingDeletion(existingBooking: BookingEntity): void {
    // Cannot delete if payment is completed
    if (existingBooking.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot delete paid booking');
    }

    // Cannot delete if booking is in progress
    if (existingBooking.status === 'IN_PROGRESS') {
      throw new BadRequestException('Cannot delete in-progress booking');
    }
  }
}
