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
import { PaginationModule } from './modules/common/pagination/pagination.module';
import { LoggerModule } from './modules/logger/logger.module';

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
    
    // Feature modules
    AuthModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    ReviewsModule,
    NotificationsModule,
    PartnersModule,
    DashboardModule,
    FileUploadModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
