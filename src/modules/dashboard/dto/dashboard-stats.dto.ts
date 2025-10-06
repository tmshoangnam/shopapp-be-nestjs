import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Total number of active users',
    example: 120,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Total number of partners',
    example: 25,
  })
  totalPartners: number;

  @ApiProperty({
    description: 'Total number of active partners',
    example: 20,
  })
  activePartners: number;

  @ApiProperty({
    description: 'Total number of services',
    example: 80,
  })
  totalServices: number;

  @ApiProperty({
    description: 'Total number of active services',
    example: 75,
  })
  activeServices: number;

  @ApiProperty({
    description: 'Total number of appointments',
    example: 500,
  })
  totalAppointments: number;

  @ApiProperty({
    description: 'Total number of completed appointments',
    example: 450,
  })
  completedAppointments: number;

  @ApiProperty({
    description: 'Total number of pending appointments',
    example: 30,
  })
  pendingAppointments: number;

  @ApiProperty({
    description: 'Total revenue from completed appointments',
    example: 12500.50,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average rating across all reviews',
    example: 4.5,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 200,
  })
  totalReviews: number;
}

export class MonthlyStatsDto {
  @ApiProperty({
    description: 'Month in YYYY-MM format',
    example: '2024-01',
  })
  month: string;

  @ApiProperty({
    description: 'Number of appointments in this month',
    example: 45,
  })
  appointments: number;

  @ApiProperty({
    description: 'Revenue for this month',
    example: 2500.75,
  })
  revenue: number;

  @ApiProperty({
    description: 'Number of new users in this month',
    example: 12,
  })
  newUsers: number;
}

export class DashboardResponseDto {
  @ApiProperty({
    description: 'Overall statistics',
    type: DashboardStatsDto,
  })
  stats: DashboardStatsDto;

  @ApiProperty({
    description: 'Monthly statistics for the last 12 months',
    type: [MonthlyStatsDto],
  })
  monthlyStats: MonthlyStatsDto[];

  @ApiProperty({
    description: 'Top performing partners',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        appointments: { type: 'number' },
        revenue: { type: 'number' },
        rating: { type: 'number' },
      },
    },
  })
  topPartners: Array<{
    id: string;
    name: string;
    appointments: number;
    revenue: number;
    rating: number;
  }>;

  @ApiProperty({
    description: 'Most popular services',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        bookings: { type: 'number' },
        revenue: { type: 'number' },
        averageRating: { type: 'number' },
      },
    },
  })
  popularServices: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
    averageRating: number;
  }>;
}
