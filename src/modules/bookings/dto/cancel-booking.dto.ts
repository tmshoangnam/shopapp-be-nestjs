import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Customer requested cancellation due to schedule conflict',
  })
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @IsString({ message: 'Cancellation reason must be a string' })
  cancellationReason: string;

  @ApiProperty({
    description: 'Additional notes for cancellation',
    example: 'Customer will reschedule for next week',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
