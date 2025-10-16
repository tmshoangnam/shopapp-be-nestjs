import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardRepository } from './dashboard.repository';
import { PaginationService } from '../common/pagination/services/pagination.service';
import { DashboardResponseDto, MonthlyStatsDto } from './dto/dashboard-stats.dto';
import { DashboardQueryDto, DashboardPeriod } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getDashboardStats(queryDto?: DashboardQueryDto): Promise<DashboardResponseDto> {
    // Use transaction to optimize database connections
    return await this.prisma.$transaction(async (tx) => {
      // Group related queries to reduce connection overhead
      const [
        basicStats,
        monthlyStats,
        topPartners,
        popularServices,
      ] = await Promise.all([
        // Basic stats in one query
        this.getBasicStatsOptimized(tx, queryDto),
        // Monthly stats
        this.getMonthlyStatsOptimized(tx, queryDto),
        // Top partners
        this.getTopPartnersOptimized(tx, queryDto),
        // Popular services
        this.getPopularServicesOptimized(tx, queryDto),
      ]);

      return {
        stats: basicStats,
        monthlyStats,
        topPartners,
        popularServices,
      };
    });
  }

  private getDateRange(queryDto?: DashboardQueryDto) {
    if (!queryDto) {
      return {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
      };
    }

    const { period = DashboardPeriod.MONTH, startDate, endDate } = queryDto;

    if (period === DashboardPeriod.CUSTOM && startDate && endDate) {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    const now = new Date();
    let start: Date;

    switch (period) {
      case DashboardPeriod.TODAY:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case DashboardPeriod.WEEK:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case DashboardPeriod.MONTH:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case DashboardPeriod.YEAR:
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: start,
      endDate: now,
    };
  }

  private async getUserStats(queryDto?: DashboardQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const [totalUsers, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    return { totalUsers, activeUsers };
  }

  private async getPartnerStats() {
    const [totalPartners, activePartners] = await Promise.all([
      this.prisma.partner.count(),
      this.prisma.partner.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    return { totalPartners, activePartners };
  }

  private async getServiceStats() {
    const [totalServices, activeServices] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({
        where: { isActive: true },
      }),
    ]);

    return { totalServices, activeServices };
  }

  private async getAppointmentStats() {
    const [totalAppointments, completedAppointments, pendingAppointments] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.appointment.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return { totalAppointments, completedAppointments, pendingAppointments };
  }

  private async getRevenueStats() {
    const result = await this.prisma.$queryRaw`
      SELECT COALESCE(SUM(s.price), 0) as total_revenue
      FROM appointments a
      JOIN services s ON a."serviceId" = s.id
      WHERE a.status = 'COMPLETED'
    `;

    return {
      totalRevenue: Number((result as any)[0]?.total_revenue || 0),
    };
  }

  private async getReviewStats() {
    const [totalReviews, avgRatingResult] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      totalReviews,
      averageRating: avgRatingResult._avg.rating || 0,
    };
  }

  private async getMonthlyStats(): Promise<MonthlyStatsDto[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await this.prisma.$queryRaw<Array<{
      month: string;
      appointments: number;
      revenue: number;
      new_users: number;
    }>>`
      WITH monthly_stats AS (
        SELECT 
          DATE_TRUNC('month', a."appointmentDate") as month,
          COUNT(a.id) as appointments,
          COALESCE(SUM(s.price), 0) as revenue
        FROM appointments a
        LEFT JOIN services s ON a."serviceId" = s.id
        WHERE a."appointmentDate" >= ${twelveMonthsAgo}
          AND a.status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', a."appointmentDate")
      ),
      monthly_users AS (
        SELECT 
          DATE_TRUNC('month', u."createdAt") as month,
          COUNT(u.id) as new_users
        FROM users u
        WHERE u."createdAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', u."createdAt")
      )
      SELECT 
        TO_CHAR(COALESCE(m.month, u.month), 'YYYY-MM') as month,
        COALESCE(m.appointments, 0)::int as appointments,
        COALESCE(m.revenue, 0)::decimal as revenue,
        COALESCE(u.new_users, 0)::int as new_users
      FROM monthly_stats m
      FULL OUTER JOIN monthly_users u ON m.month = u.month
      ORDER BY month DESC
      LIMIT 12
    `;

    return monthlyData.map((row) => ({
      month: row.month,
      appointments: row.appointments,
      revenue: Number(row.revenue),
      newUsers: row.new_users,
    }));
  }

  private async getTopPartners() {
    const topPartners = await this.prisma.$queryRaw<Array<{
      id: string;
      name: string;
      appointments: number;
      revenue: number;
      rating: number;
    }>>`
      SELECT 
        p.id,
        p.name,
        COUNT(a.id)::int as appointments,
        COALESCE(SUM(s.price), 0)::decimal as revenue,
        COALESCE(AVG(r.rating), 0)::decimal as rating
      FROM partners p
      LEFT JOIN appointments a ON p.id = a."partnerId" 
        AND a.status = 'COMPLETED'
        AND a."appointmentDate" >= NOW() - INTERVAL '30 days'
      LEFT JOIN services s ON a."serviceId" = s.id
      LEFT JOIN reviews r ON a.id = r."appointmentId"
      WHERE p.status = 'ACTIVE'
      GROUP BY p.id, p.name
      HAVING COUNT(a.id) > 0
      ORDER BY appointments DESC, revenue DESC
      LIMIT 5
    `;

    return topPartners.map((partner) => ({
      id: partner.id,
      name: partner.name,
      appointments: partner.appointments,
      revenue: Number(partner.revenue),
      rating: Number(partner.rating),
    }));
  }

  private async getPopularServices() {
    const popularServices = await this.prisma.$queryRaw<Array<{
      id: string;
      name: string;
      bookings: number;
      revenue: number;
      average_rating: number;
    }>>`
      SELECT 
        s.id,
        s.name,
        COUNT(a.id)::int as bookings,
        COALESCE(SUM(s.price), 0)::decimal as revenue,
        COALESCE(AVG(r.rating), 0)::decimal as average_rating
      FROM services s
      LEFT JOIN appointments a ON s.id = a."serviceId" 
        AND a.status = 'COMPLETED'
        AND a."appointmentDate" >= NOW() - INTERVAL '30 days'
      LEFT JOIN reviews r ON a.id = r."appointmentId"
      WHERE s."isActive" = true
      GROUP BY s.id, s.name
      HAVING COUNT(a.id) > 0
      ORDER BY bookings DESC, revenue DESC
      LIMIT 5
    `;

    return popularServices.map((service) => ({
      id: service.id,
      name: service.name,
      bookings: service.bookings,
      revenue: Number(service.revenue),
      averageRating: Number(service.average_rating),
    }));
  }

  async getQuickStats() {
    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getTodayStats(),
      this.getWeekStats(),
      this.getMonthStats(),
    ]);

    return {
      today: {
        appointments: todayStats,
        revenue: 0, // Today revenue calculation can be added if needed
      },
      thisWeek: {
        appointments: weekStats.count,
        revenue: weekStats.revenue,
      },
      thisMonth: {
        appointments: monthStats.count,
        revenue: monthStats.revenue,
      },
    };
  }

  private async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
        status: 'COMPLETED',
      },
    });
  }

  private async getWeekStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [count, revenue] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          appointmentDate: { gte: weekAgo },
          status: 'COMPLETED',
        },
      }),
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(s.price), 0) as total_revenue
        FROM appointments a
        JOIN services s ON a."serviceId" = s.id
        WHERE a."appointmentDate" >= ${weekAgo} AND a.status = 'COMPLETED'
      `,
    ]);

    return {
      count,
      revenue: Number((revenue as any)[0]?.total_revenue || 0),
    };
  }

  private async getMonthStats() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [count, revenue] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          appointmentDate: { gte: monthAgo },
          status: 'COMPLETED',
        },
      }),
      this.prisma.$queryRaw`
        SELECT COALESCE(SUM(s.price), 0) as total_revenue
        FROM appointments a
        JOIN services s ON a."serviceId" = s.id
        WHERE a."appointmentDate" >= ${monthAgo} AND a.status = 'COMPLETED'
      `,
    ]);

    return {
      count,
      revenue: Number((revenue as any)[0]?.total_revenue || 0),
    };
  }

  // Optimized methods using transaction
  private async getBasicStatsOptimized(tx: any, queryDto?: DashboardQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    // Single query to get all basic stats
    const result = await tx.$queryRaw`
      WITH user_stats AS (
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN "isActive" = true AND "lastLogin" >= ${startDate} THEN 1 END) as active_users
        FROM users
      ),
      partner_stats AS (
        SELECT 
          COUNT(*) as total_partners,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_partners
        FROM partners
      ),
      service_stats AS (
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_services
        FROM services
      ),
      appointment_stats AS (
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_appointments,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_appointments
        FROM appointments
      ),
      revenue_stats AS (
        SELECT 
          COALESCE(SUM(s.price), 0) as total_revenue
        FROM appointments a
        JOIN services s ON a."serviceId" = s.id
        WHERE a.status = 'COMPLETED'
      ),
      review_stats AS (
        SELECT 
          COUNT(*) as total_reviews,
          COALESCE(AVG(rating), 0) as average_rating
        FROM reviews
      )
      SELECT 
        us.total_users,
        us.active_users,
        ps.total_partners,
        ps.active_partners,
        ss.total_services,
        ss.active_services,
        aps.total_appointments,
        aps.completed_appointments,
        aps.pending_appointments,
        rs.total_revenue,
        rvs.total_reviews,
        rvs.average_rating
      FROM user_stats us
      CROSS JOIN partner_stats ps
      CROSS JOIN service_stats ss
      CROSS JOIN appointment_stats aps
      CROSS JOIN revenue_stats rs
      CROSS JOIN review_stats rvs
    `;

    const stats = (result as any)[0];
    return {
      totalUsers: Number(stats.total_users),
      activeUsers: Number(stats.active_users),
      totalPartners: Number(stats.total_partners),
      activePartners: Number(stats.active_partners),
      totalServices: Number(stats.total_services),
      activeServices: Number(stats.active_services),
      totalAppointments: Number(stats.total_appointments),
      completedAppointments: Number(stats.completed_appointments),
      pendingAppointments: Number(stats.pending_appointments),
      totalRevenue: Number(stats.total_revenue),
      totalReviews: Number(stats.total_reviews),
      averageRating: Number(stats.average_rating),
    };
  }

  private async getMonthlyStatsOptimized(tx: any, queryDto?: DashboardQueryDto) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await tx.$queryRaw`
      WITH monthly_stats AS (
        SELECT 
          DATE_TRUNC('month', a."appointmentDate") as month,
          COUNT(a.id) as appointments,
          COALESCE(SUM(s.price), 0) as revenue
        FROM appointments a
        LEFT JOIN services s ON a."serviceId" = s.id
        WHERE a."appointmentDate" >= ${twelveMonthsAgo}
          AND a.status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', a."appointmentDate")
      ),
      monthly_users AS (
        SELECT 
          DATE_TRUNC('month', u."createdAt") as month,
          COUNT(u.id) as new_users
        FROM users u
        WHERE u."createdAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', u."createdAt")
      )
      SELECT 
        TO_CHAR(COALESCE(m.month, u.month), 'YYYY-MM') as month,
        COALESCE(m.appointments, 0)::int as appointments,
        COALESCE(m.revenue, 0)::decimal as revenue,
        COALESCE(u.new_users, 0)::int as new_users
      FROM monthly_stats m
      FULL OUTER JOIN monthly_users u ON m.month = u.month
      ORDER BY month DESC
      LIMIT 12
    `;

    return monthlyData.map((row: any) => ({
      month: row.month,
      appointments: row.appointments,
      revenue: Number(row.revenue),
      newUsers: row.new_users,
    }));
  }

  private async getTopPartnersOptimized(tx: any, queryDto?: DashboardQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const topPartners = await tx.$queryRaw`
      SELECT 
        p.id,
        p.name,
        COUNT(a.id)::int as appointments,
        COALESCE(SUM(s.price), 0)::decimal as revenue,
        COALESCE(AVG(r.rating), 0)::decimal as rating
      FROM partners p
      LEFT JOIN appointments a ON p.id = a."partnerId" 
        AND a.status = 'COMPLETED'
        AND a."appointmentDate" >= ${startDate}
        AND a."appointmentDate" <= ${endDate}
      LEFT JOIN services s ON a."serviceId" = s.id
      LEFT JOIN reviews r ON a.id = r."appointmentId"
      WHERE p.status = 'ACTIVE'
      GROUP BY p.id, p.name
      HAVING COUNT(a.id) > 0
      ORDER BY appointments DESC, revenue DESC
      LIMIT 5
    `;

    return topPartners.map((partner: any) => ({
      id: partner.id,
      name: partner.name,
      appointments: partner.appointments,
      revenue: Number(partner.revenue),
      rating: Number(partner.rating),
    }));
  }

  private async getPopularServicesOptimized(tx: any, queryDto?: DashboardQueryDto) {
    const { startDate, endDate } = this.getDateRange(queryDto);

    const popularServices = await tx.$queryRaw`
      SELECT 
        s.id,
        s.name,
        COUNT(a.id)::int as bookings,
        COALESCE(SUM(s.price), 0)::decimal as revenue,
        COALESCE(AVG(r.rating), 0)::decimal as average_rating
      FROM services s
      LEFT JOIN appointments a ON s.id = a."serviceId" 
        AND a.status = 'COMPLETED'
        AND a."appointmentDate" >= ${startDate}
        AND a."appointmentDate" <= ${endDate}
      LEFT JOIN reviews r ON a.id = r."appointmentId"
      WHERE s."isActive" = true
      GROUP BY s.id, s.name
      HAVING COUNT(a.id) > 0
      ORDER BY bookings DESC, revenue DESC
      LIMIT 5
    `;

    return popularServices.map((service: any) => ({
      id: service.id,
      name: service.name,
      bookings: service.bookings,
      revenue: Number(service.revenue),
      averageRating: Number(service.average_rating),
    }));
  }
}
