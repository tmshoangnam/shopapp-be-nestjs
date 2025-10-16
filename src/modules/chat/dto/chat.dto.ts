import { IsOptional, IsString, IsUUID, IsIn, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsIn(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO'])
  messageType?: string;

  @IsOptional()
  @IsString()
  clientMessageId?: string;
}

export class TypingDto {
  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsIn([true, false])
  isTyping!: boolean;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;
}

export class MarkAsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  messageIds!: string[];
}

