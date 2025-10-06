import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto, ServiceFilterDto } from './dto/services.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({
      data,
    });
  }

  async findAll(filter: ServiceFilterDto) {
    const { page = 1, limit = 10, search, category, minPrice, maxPrice, isActive } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointments: {
            select: { id: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    // Calculate average rating for each service
    const servicesWithRating = services.map((service) => {
      const avgRating =
        service.reviews.length > 0
          ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
          : 0;

      return {
        ...service,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews: service.reviews.length,
        totalAppointments: service.appointments.length,
        reviews: undefined,
        appointments: undefined,
      };
    });

    return {
      data: servicesWithRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        appointments: {
          select: { id: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const avgRating =
      service.reviews.length > 0
        ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
        : 0;

    return {
      ...service,
      averageRating: Number(avgRating.toFixed(1)),
      totalReviews: service.reviews.length,
      totalAppointments: service.appointments.length,
    };
  }

  async update(id: string, data: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }

  async getCategories() {
    const services = await this.prisma.service.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });

    return services.map((s) => s.category).filter((c) => c !== null);
  }

  async getPopularServices(limit = 10) {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      include: {
        appointments: {
          select: { id: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      take: limit,
    });

    const servicesWithStats = services
      .map((service) => {
        const avgRating =
          service.reviews.length > 0
            ? service.reviews.reduce((acc, review) => acc + review.rating, 0) / service.reviews.length
            : 0;

        return {
          ...service,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: service.reviews.length,
          totalAppointments: service.appointments.length,
          popularityScore: service.appointments.length * 0.7 + avgRating * 0.3,
          reviews: undefined,
          appointments: undefined,
        };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);

    return servicesWithStats;
  }
}
