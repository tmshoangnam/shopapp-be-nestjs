import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-stats.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardResponseDto,
  })
  async getDashboardStats(@Query() queryDto?: DashboardQueryDto): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardStats(queryDto);
  }

  @Get('quick-stats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Get quick statistics for today, this week, and this month' })
  @ApiResponse({
    status: 200,
    description: 'Quick statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        today: {
          type: 'object',
          properties: {
            appointments: { type: 'number', example: 5 },
            revenue: { type: 'number', example: 250.75 },
          },
        },
        thisWeek: {
          type: 'object',
          properties: {
            appointments: { type: 'number', example: 35 },
            revenue: { type: 'number', example: 1750.50 },
          },
        },
        thisMonth: {
          type: 'object',
          properties: {
            appointments: { type: 'number', example: 150 },
            revenue: { type: 'number', example: 7500.25 },
          },
        },
      },
    },
  })
  async getQuickStats() {
    return this.dashboardService.getQuickStats();
  }
}
