import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingEntity } from './entities';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
import { IBookingRepository, PaginatedResult } from './interfaces';
import { BookingMapper } from './mappers';
import { Booking } from '@prisma/client';
// BookingStatus enum will be imported from Prisma client after generation

@Injectable()
export class BookingsRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingEntity> {
    const bookingData = BookingMapper.toCreateData(createBookingDto);
    
    const booking = await this.prisma.booking.create({
      data: bookingData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            image: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            transactionId: true,
            gateway: true,
            createdAt: true,
          },
        },
      },
    });

    return BookingMapper.toEntity(booking as Booking);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            image: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            transactionId: true,
            gateway: true,
            createdAt: true,
          },
        },
      },
    });

    return booking ? BookingMapper.toEntity(booking as Booking) : null;
  }

  async findByUserId(userId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...this.buildWhereClause(options),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              image: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              transactionId: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: BookingMapper.toEntityArray(bookings as Booking[]),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByServiceId(serviceId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = {
      serviceId,
      ...this.buildWhereClause(options),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              image: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              transactionId: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: BookingMapper.toEntityArray(bookings as Booking[]),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByPartnerId(partnerId: string, options: QueryBookingDto = {}): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = {
      partnerId,
      ...this.buildWhereClause(options),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              image: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              transactionId: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: BookingMapper.toEntityArray(bookings as Booking[]),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(options: QueryBookingDto = {}): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(options);

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              image: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              transactionId: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: BookingMapper.toEntityArray(bookings as Booking[]),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity> {
    const updateData = BookingMapper.toUpdateData(updateBookingDto);

    const booking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            image: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            transactionId: true,
            gateway: true,
            createdAt: true,
          },
        },
      },
    });

    return BookingMapper.toEntity(booking as Booking);
  }

  async cancel(id: string, cancellationReason: string): Promise<BookingEntity> {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason,
        cancelledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            image: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            transactionId: true,
            gateway: true,
            createdAt: true,
          },
        },
      },
    });

    return BookingMapper.toEntity(booking as Booking);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: { id },
    });
    return count > 0;
  }

  async countByStatus(status: string): Promise<number> {
    return this.prisma.booking.count({
      where: { status: status as any },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, options: QueryBookingDto = {}): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...this.buildWhereClause(options),
      bookingDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration: true,
              price: true,
              image: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              method: true,
              status: true,
              transactionId: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: BookingMapper.toEntityArray(bookings as Booking[]),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private buildWhereClause(options: QueryBookingDto) {
    const where: any = {};

    if (options.search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: options.search, mode: 'insensitive' } },
              { lastName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          service: {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          partner: {
            name: { contains: options.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.serviceId) {
      where.serviceId = options.serviceId;
    }

    if (options.partnerId) {
      where.partnerId = options.partnerId;
    }

    if (options.staffId) {
      where.staffId = options.staffId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.paymentStatus) {
      where.paymentStatus = options.paymentStatus;
    }

    if (options.startDate && options.endDate) {
      where.bookingDate = {
        gte: new Date(options.startDate),
        lte: new Date(options.endDate),
      };
    }

    return where;
  }
}
