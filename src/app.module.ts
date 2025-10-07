import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { ChatModule } from './modules/chat/chat.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PartnersModule } from './modules/partners/partners.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaginationModule } from './modules/common/pagination/pagination.module';
import { LoggerModule } from './modules/logger/logger.module';
import { RedisModule } from './modules/common/redis/redis.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Configuration module - Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    
    // Logger module
    LoggerModule,
    
    // Core modules
    PrismaModule,
    PaginationModule,
    RedisModule, // Redis service for streams and caching
    
    // Feature modules
    AuthModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    BookingsModule, // Booking management module
    ReviewsModule,
    NotificationsModule,
    PartnersModule,
    DashboardModule,
    FileUploadModule,
    ChatModule,
    AuditModule, // Audit logging module
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
