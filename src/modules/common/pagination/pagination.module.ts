import { Module, Global } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PaginationService],
  exports: [PaginationService],
})
export class PaginationModule {}
