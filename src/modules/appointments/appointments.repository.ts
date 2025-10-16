import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';
import { AppointmentStatus } from '@prisma/client';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilterDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentsRepository extends AbstractPrismaRepository<any, any, CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilterDto> {
  constructor(prisma: PrismaService) { super(prisma); }

  protected get model() { return this.prisma.appointment; }
  protected toEntity(record: any) { return record; }
  protected toCreateData(dto: CreateAppointmentDto) { return dto as any; }
  protected toUpdateData(dto: UpdateAppointmentDto) { return dto as any; }
  protected defaultInclude() {
    return {
      service: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true } },
      review: true,
    } as const;
  }
  protected buildWhereClause(filter: AppointmentFilterDto = {} as AppointmentFilterDto) {
    const where: any = {};
    if ((filter as any).userId) where.userId = (filter as any).userId;
    if (filter.status) where.status = filter.status as any;
    if (filter.serviceId) where.serviceId = filter.serviceId;
    if (filter.startDate || filter.endDate) {
      where.appointmentDate = {};
      if (filter.startDate) where.appointmentDate.gte = new Date(filter.startDate);
      if (filter.endDate) where.appointmentDate.lte = new Date(filter.endDate);
    }
    return where;
  }

  async countByStatus(status: AppointmentStatus, where: any = {}) {
    return this.prisma.appointment.count({ where: { ...where, status } });
  }
}

