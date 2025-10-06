import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { QueryPartnerDto } from './dto/query-partner.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationApi, PaginatedResponseDto } from '../common/pagination/decorators/pagination.decorator';
import { Partner, Role } from '@prisma/client';

@ApiTags('Partners')
@Controller('partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Partner created successfully',
    type: PartnerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Partner with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(@Body() createPartnerDto: CreatePartnerDto): Promise<Partner> {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get all partners with pagination and filtering' })
  @PaginationApi({
    description: 'Partners retrieved successfully',
    // example: { $ref: '#/components/schemas/PartnerResponseDto' },
    searchable: true,
    customSortFields: ['name', 'email', 'createdAt', 'updatedAt', 'status'],
  })
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() queryDto: QueryPartnerDto) {
    return this.partnersService.findAll(queryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get partner by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner retrieved successfully',
    type: PartnerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  async findOne(@Param('id') id: string): Promise<Partner> {
    return this.partnersService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get partner statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  @ApiBearerAuth('JWT-auth')
  async getStats(@Param('id') id: string) {
    return this.partnersService.getPartnerStats(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update partner by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner updated successfully',
    type: PartnerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Partner with this email already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete partner by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Partner deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete partner with associated services or appointments',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.partnersService.remove(id);
  }
}
