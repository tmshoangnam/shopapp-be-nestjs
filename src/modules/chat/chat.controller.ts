import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

export class GetMessagesDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  senderId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;
}

export class MarkAsReadDto {
  @IsString({ each: true })
  messageIds: string[];
}

export class DeleteMessageDto {
  @IsString()
  messageId: string;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  async getMessages(
    @Query() query: GetMessagesDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    
    // If no specific params, get all messages for the user
    if (!query.roomId && !query.senderId && !query.receiverId) {
      return this.chatService.getUserMessages(userId, {
        skip: query.skip || 0,
        take: query.take || 50,
      });
    }

    return this.chatService.getMessages(query);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    const userId = req.user.id;
    return this.chatService.getConversations(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.sub;
    return this.chatService.getUnreadCount(userId);
  }

  @Put('mark-as-read')
  async markAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.chatService.markAsRead(markAsReadDto.messageIds);
  }

  @Delete('message/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.chatService.deleteMessage(messageId, userId);
  }

  @Get('admin/all-messages')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllMessages(
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getAllMessages(query);
  }

  @Get('admin/online-users')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getOnlineUsers() {
    return this.chatService.getOnlineUsers();
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getChatStats() {
    return this.chatService.getChatStats();
  }
}

