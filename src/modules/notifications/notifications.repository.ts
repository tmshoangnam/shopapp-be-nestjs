import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';
import { CreateNotificationDto, NotificationFilterDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsRepository extends AbstractPrismaRepository<any, any, CreateNotificationDto, Partial<CreateNotificationDto>, NotificationFilterDto> {
  constructor(prisma: PrismaService) { super(prisma); }
  protected get model() { return this.prisma.notification; }
  protected toEntity(record: any) { return record; }
  protected toCreateData(dto: CreateNotificationDto) { return dto as any; }
  protected toUpdateData(dto: Partial<CreateNotificationDto>) { return dto as any; }
  protected buildWhereClause(filter: NotificationFilterDto = {} as NotificationFilterDto) {
    const where: any = {};
    if ((filter as any).userId) where.userId = (filter as any).userId;
    if (filter.isRead !== undefined) where.isRead = filter.isRead;
    if (filter.type) where.type = filter.type as any;
    return where;
  }
}

