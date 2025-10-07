import { Booking, User, Service, Partner, Payment } from '@prisma/client';
import { BookingEntity } from '../entities';
import { CreateBookingDto, UpdateBookingDto } from '../dto';

export class BookingMapper {
  /**
   * Map Prisma Booking to BookingEntity
   * @param booking - Prisma Booking object
   * @returns BookingEntity
   */
  static toEntity(booking: Booking & {
    user?: User;
    service?: Service;
    partner?: Partner;
    payments?: Payment[];
  }): BookingEntity {
    return {
      id: booking.id,
      userId: booking.userId,
      serviceId: booking.serviceId,
      partnerId: booking.partnerId,
      staffId: booking.staffId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      discountAmount: booking.discountAmount ? Number(booking.discountAmount) : undefined,
      finalAmount: Number(booking.finalAmount),
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      user: booking.user ? {
        id: booking.user.id,
        email: booking.user.email,
        firstName: booking.user.firstName || '',
        lastName: booking.user.lastName || '',
        phone: booking.user.phone || '',
      } : undefined,
      service: booking.service ? {
        id: booking.service.id,
        name: booking.service.name,
        description: booking.service.description || '',
        category: booking.service.category || '',
        duration: booking.service.duration,
        price: Number(booking.service.price),
        image: booking.service.image || '',
      } : undefined,
      partner: booking.partner ? {
        id: booking.partner.id,
        name: booking.partner.name,
        email: booking.partner.email,
        phone: booking.partner.phone || '',
        address: booking.partner.address || '',
      } : undefined,
      payments: booking.payments?.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        gateway: payment.gateway,
        createdAt: payment.createdAt,
      })),
    };
  }

  /**
   * Map CreateBookingDto to Prisma create data
   * @param createBookingDto - Create booking DTO
   * @returns Prisma create data
   */
  static toCreateData(createBookingDto: CreateBookingDto) {
    return {
      userId: createBookingDto.userId,
      serviceId: createBookingDto.serviceId,
      partnerId: createBookingDto.partnerId,
      staffId: createBookingDto.staffId,
      bookingDate: new Date(createBookingDto.bookingDate),
      startTime: new Date(createBookingDto.startTime),
      endTime: new Date(createBookingDto.endTime),
      totalAmount: createBookingDto.totalAmount,
      discountAmount: createBookingDto.discountAmount || 0,
      finalAmount: createBookingDto.finalAmount,
      paymentMethod: createBookingDto.paymentMethod,
      notes: createBookingDto.notes,
    };
  }

  /**
   * Map UpdateBookingDto to Prisma update data
   * @param updateBookingDto - Update booking DTO
   * @returns Prisma update data
   */
  static toUpdateData(updateBookingDto: UpdateBookingDto) {
    const updateData: any = {};

    if (updateBookingDto.partnerId !== undefined) {
      updateData.partnerId = updateBookingDto.partnerId;
    }
    if (updateBookingDto.staffId !== undefined) {
      updateData.staffId = updateBookingDto.staffId;
    }
    if (updateBookingDto.bookingDate !== undefined) {
      updateData.bookingDate = new Date(updateBookingDto.bookingDate);
    }
    if (updateBookingDto.startTime !== undefined) {
      updateData.startTime = new Date(updateBookingDto.startTime);
    }
    if (updateBookingDto.endTime !== undefined) {
      updateData.endTime = new Date(updateBookingDto.endTime);
    }
    if (updateBookingDto.status !== undefined) {
      updateData.status = updateBookingDto.status;
    }
    if (updateBookingDto.totalAmount !== undefined) {
      updateData.totalAmount = updateBookingDto.totalAmount;
    }
    if (updateBookingDto.discountAmount !== undefined) {
      updateData.discountAmount = updateBookingDto.discountAmount;
    }
    if (updateBookingDto.finalAmount !== undefined) {
      updateData.finalAmount = updateBookingDto.finalAmount;
    }
    if (updateBookingDto.paymentStatus !== undefined) {
      updateData.paymentStatus = updateBookingDto.paymentStatus;
    }
    if (updateBookingDto.paymentMethod !== undefined) {
      updateData.paymentMethod = updateBookingDto.paymentMethod;
    }
    if (updateBookingDto.notes !== undefined) {
      updateData.notes = updateBookingDto.notes;
    }
    if (updateBookingDto.cancellationReason !== undefined) {
      updateData.cancellationReason = updateBookingDto.cancellationReason;
    }

    return updateData;
  }

  /**
   * Map multiple Prisma Bookings to BookingEntities
   * @param bookings - Array of Prisma Booking objects
   * @returns Array of BookingEntity
   */
  static toEntityArray(bookings: (Booking & {
    user?: User;
    service?: Service;
    partner?: Partner;
    payments?: Payment[];
  })[]): BookingEntity[] {
    return bookings.map(booking => this.toEntity(booking));
  }
}
