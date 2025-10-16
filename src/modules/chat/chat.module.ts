import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatRepository],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
