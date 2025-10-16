import { Injectable } from '@nestjs/common';
import { Prisma, Partner } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AbstractPrismaRepository } from '../common/repository/abstract-prisma.repository';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { QueryPartnerDto } from './dto/query-partner.dto';

@Injectable()
export class PartnersRepository extends AbstractPrismaRepository<Partner, Partner, CreatePartnerDto, UpdatePartnerDto, QueryPartnerDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.partner;
  }

  protected toEntity(record: Partner) {
    return record;
  }

  protected toCreateData(dto: CreatePartnerDto) {
    return dto as Prisma.PartnerCreateInput;
  }

  protected toUpdateData(dto: UpdatePartnerDto) {
    return dto as Prisma.PartnerUpdateInput;
  }

  protected buildWhereClause(filter: QueryPartnerDto = {} as QueryPartnerDto) {
    const where: Prisma.PartnerWhereInput = {};
    if (filter.status) where.status = filter.status as any;
    if ((filter as any).search) {
      const search = (filter as any).search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}

