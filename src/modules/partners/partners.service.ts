import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination/services/pagination.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { QueryPartnerDto } from './dto/query-partner.dto';
import { Partner, Prisma } from '@prisma/client';
import { PaginationOptions } from '../common/pagination/interfaces/pagination.interface';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    try {
      const partner = await this.prisma.partner.create({
        data: createPartnerDto,
      });
      return partner;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Partner with this email already exists');
        }
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryPartnerDto) {
    const { status } = queryDto;

    const where: Prisma.PartnerWhereInput = {};

    if (status) {
      where.status = status;
    }

    const searchFields = ['name', 'email', 'description'];

    return this.paginationService.paginateWithSearch<Partner>(
      'partner',
      queryDto as PaginationOptions & { search?: string; },
      searchFields,
      where,
      {
        _count: {
          select: {
            services: true,
            appointments: true,
          },
        },
      },
    );
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
          },
          orderBy: {
            appointmentDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            services: true,
            appointments: true,
          },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    try {
      const partner = await this.prisma.partner.update({
        where: { id },
        data: updatePartnerDto,
      });
      return partner;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Partner with this email already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.partner.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete partner with associated services or appointments');
        }
      }
      throw error;
    }
  }

  async getPartnerStats(id: string) {
    const partner = await this.findOne(id);

    const [
      totalServices,
      activeServices,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.service.count({
        where: { partnerId: id },
      }),
      this.prisma.service.count({
        where: { partnerId: id, isActive: true },
      }),
      this.prisma.appointment.count({
        where: { partnerId: id },
      }),
      this.prisma.appointment.count({
        where: { partnerId: id, status: 'COMPLETED' },
      }),
      this.prisma.appointment.count({
        where: { partnerId: id, status: 'PENDING' },
      }),
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(s.price), 0) as total_revenue
        FROM appointments a
        JOIN services s ON a."serviceId" = s.id
        WHERE a."partnerId" = ${id} AND a.status = 'COMPLETED'
      `,
    ]);

    return {
      partner: {
        id: partner.id,
        name: partner.name,
        status: partner.status,
      },
      stats: {
        totalServices,
        activeServices,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
        totalRevenue: Number((totalRevenue as any)[0]?.total_revenue || 0),
      },
    };
  }
}
