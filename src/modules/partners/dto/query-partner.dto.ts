import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '@prisma/client';
import { SearchablePaginationDto } from '../../common/pagination/dto/pagination.dto';

export class QueryPartnerDto extends SearchablePaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by partner status',
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;
}