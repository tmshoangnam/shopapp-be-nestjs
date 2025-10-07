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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, CancelBookingDto, BookingResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new booking for a service',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - time slot not available',
  })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieves all bookings with optional filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'serviceId', required: false, type: String, description: 'Filter by service ID' })
  @ApiQuery({ name: 'partnerId', required: false, type: String, description: 'Filter by partner ID' })
  @ApiQuery({ name: 'staffId', required: false, type: String, description: 'Filter by staff ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REFUNDED'], description: 'Filter by status' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'], description: 'Filter by payment status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for date range filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for date range filter' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  async findAll(@Query() query: QueryBookingDto) {
    return this.bookingsService.findAll(query);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get bookings by user ID',
    description: 'Retrieves all bookings for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findByUserId(@Param('userId') userId: string, @Query() query: QueryBookingDto) {
    return this.bookingsService.findByUserId(userId, query);
  }

  @Get('service/:serviceId')
  @ApiOperation({
    summary: 'Get bookings by service ID',
    description: 'Retrieves all bookings for a specific service',
  })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Service bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async findByServiceId(@Param('serviceId') serviceId: string, @Query() query: QueryBookingDto) {
    return this.bookingsService.findByServiceId(serviceId, query);
  }

  @Get('partner/:partnerId')
  @ApiOperation({
    summary: 'Get bookings by partner ID',
    description: 'Retrieves all bookings for a specific partner',
  })
  @ApiParam({ name: 'partnerId', description: 'Partner ID' })
  @ApiResponse({
    status: 200,
    description: 'Partner bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Partner not found',
  })
  async findByPartnerId(@Param('partnerId') partnerId: string, @Query() query: QueryBookingDto) {
    return this.bookingsService.findByPartnerId(partnerId, query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get booking statistics',
    description: 'Retrieves booking statistics and analytics',
  })
  @ApiQuery({ name: 'partnerId', required: false, type: String, description: 'Filter by partner ID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of bookings' },
        pending: { type: 'number', description: 'Number of pending bookings' },
        confirmed: { type: 'number', description: 'Number of confirmed bookings' },
        completed: { type: 'number', description: 'Number of completed bookings' },
        cancelled: { type: 'number', description: 'Number of cancelled bookings' },
        totalRevenue: { type: 'number', description: 'Total revenue from completed bookings' },
      },
    },
  })
  async getStatistics(@Query('partnerId') partnerId?: string) {
    return this.bookingsService.getStatistics(partnerId);
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Check booking availability',
    description: 'Checks if a time slot is available for booking',
  })
  @ApiQuery({ name: 'serviceId', type: String, description: 'Service ID' })
  @ApiQuery({ name: 'startTime', type: String, description: 'Start time (ISO string)' })
  @ApiQuery({ name: 'endTime', type: String, description: 'End time (ISO string)' })
  @ApiQuery({ name: 'excludeBookingId', required: false, type: String, description: 'Booking ID to exclude from check' })
  @ApiResponse({
    status: 200,
    description: 'Availability checked successfully',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', description: 'Whether the time slot is available' },
      },
    },
  })
  async checkAvailability(
    @Query('serviceId') serviceId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('excludeBookingId') excludeBookingId?: string,
  ) {
    const available = await this.bookingsService.checkAvailability(
      serviceId,
      new Date(startTime),
      new Date(endTime),
      excludeBookingId,
    );
    return { available };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieves a specific booking by its ID',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update booking',
    description: 'Updates a specific booking',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - update not allowed',
  })
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancels a specific booking',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cancellation not allowed',
  })
  async cancel(@Param('id') id: string, @Body() cancelBookingDto: CancelBookingDto) {
    return this.bookingsService.cancel(id, cancelBookingDto);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Confirm booking',
    description: 'Confirms a pending booking (Staff/Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking confirmed successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - confirmation not allowed',
  })
  async confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Complete booking',
    description: 'Marks a booking as completed (Staff/Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking completed successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - completion not allowed',
  })
  async complete(@Param('id') id: string) {
    return this.bookingsService.complete(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete booking',
    description: 'Deletes a specific booking (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - deletion not allowed',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookingsService.delete(id);
  }
}
