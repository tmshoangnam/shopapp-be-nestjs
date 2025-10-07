import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { PromotionsRepository } from './promotions.repository';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module for managing promotions
 * @class PromotionsModule
 */
@Module({
  imports: [PrismaModule],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    PromotionsRepository,
    {
      provide: 'IPromotionService',
      useClass: PromotionsService,
    },
    {
      provide: 'IPromotionRepository',
      useClass: PromotionsRepository,
    },
  ],
  exports: [
    PromotionsService,
    PromotionsRepository,
    'IPromotionService',
    'IPromotionRepository',
  ],
})
export class PromotionsModule {}
