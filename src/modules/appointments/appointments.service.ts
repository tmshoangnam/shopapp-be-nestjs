import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentStatus } from '@prisma/client';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilterDto,
} from './dto/appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService, private readonly appointmentsRepository: AppointmentsRepository) {}

  async create(userId: string, data: CreateAppointmentDto) {
    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if time slot is available
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        serviceId: data.serviceId,
        appointmentDate: data.appointmentDate,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Time slot is not available');
    }

    return this.appointmentsRepository.create({
      userId,
      serviceId: data.serviceId,
      appointmentDate: data.appointmentDate,
      notes: data.notes,
      status: AppointmentStatus.PENDING,
    } as any);
  }

  async findAll(userId: string, filter: AppointmentFilterDto, isAdmin = false) {
    const options = isAdmin ? filter : { ...filter, userId } as any;
    return this.appointmentsRepository.findAll(options);
  }

  async findOne(id: string, userId?: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        review: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check ownership if userId is provided
    if (userId && appointment.userId !== userId) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, userId: string, data: UpdateAppointmentDto) {
    const appointment = await this.findOne(id, userId);

    // Check if appointment can be updated
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot update completed or cancelled appointment');
    }

    // If changing appointment date, check availability
    if (data.appointmentDate) {
      const existingAppointment = await this.prisma.appointment.findFirst({
        where: {
          serviceId: appointment.serviceId,
          appointmentDate: data.appointmentDate,
          id: { not: id },
          status: {
            in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
          },
        },
      });

      if (existingAppointment) {
        throw new BadRequestException('Time slot is not available');
      }
    }

    return this.appointmentsRepository.update(id, data as any);
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.appointmentsRepository.update(id, { status } as any);
  }

  async cancel(id: string, userId: string) {
    const appointment = await this.findOne(id, userId);

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot cancel completed or cancelled appointment');
    }

    return this.appointmentsRepository.update(id, { status: AppointmentStatus.CANCELLED } as any);
  }

  async getAvailableSlots(serviceId: string, date: Date) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Get all booked appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        serviceId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
      select: {
        appointmentDate: true,
      },
    });

    // Generate time slots (9 AM to 6 PM, every 30 minutes)
    const slots = [];
    const workStart = 9; // 9 AM
    const workEnd = 18; // 6 PM
    const slotDuration = 30; // minutes

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if slot is booked
        const isBooked = bookedAppointments.some(
          (apt) => apt.appointmentDate.getTime() === slotTime.getTime(),
        );

        slots.push({
          time: slotTime,
          available: !isBooked,
        });
      }
    }

    return slots;
  }

  async getStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.appointmentsRepository.countByStatus(AppointmentStatus.PENDING, where),
      this.appointmentsRepository.countByStatus(AppointmentStatus.CONFIRMED, where),
      this.appointmentsRepository.countByStatus(AppointmentStatus.COMPLETED, where),
      this.appointmentsRepository.countByStatus(AppointmentStatus.CANCELLED, where),
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }
}
