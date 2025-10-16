import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaginationModule } from '../common/pagination/pagination.module';
import { PartnersRepository } from './partners.repository';

@Module({
  imports: [PrismaModule, PaginationModule],
  controllers: [PartnersController],
  providers: [PartnersService, PartnersRepository],
  exports: [PartnersService, PartnersRepository],
})
export class PartnersModule {}