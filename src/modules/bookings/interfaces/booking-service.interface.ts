import { BookingEntity } from '../entities';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto, CancelBookingDto } from '../dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IBookingService {
  /**
   * Create a new booking
   * @param createBookingDto - Booking creation data
   * @returns Promise<BookingEntity> - Created booking
   * @throws {ConflictException} When booking conflicts with existing booking
   * @throws {BadRequestException} When validation fails
   */
  create(createBookingDto: CreateBookingDto): Promise<BookingEntity>;

  /**
   * Get booking by ID
   * @param id - Booking ID
   * @returns Promise<BookingEntity> - Found booking
   * @throws {NotFoundException} When booking not found
   */
  findById(id: string): Promise<BookingEntity>;

  /**
   * Get bookings by user ID
   * @param userId - User ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - User's bookings
   */
  findByUserId(userId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Get bookings by service ID
   * @param serviceId - Service ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Service bookings
   */
  findByServiceId(serviceId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Get bookings by partner ID
   * @param partnerId - Partner ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Partner bookings
   */
  findByPartnerId(partnerId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Get all bookings with filters
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Filtered bookings
   */
  findAll(options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Update booking
   * @param id - Booking ID
   * @param updateBookingDto - Update data
   * @returns Promise<BookingEntity> - Updated booking
   * @throws {NotFoundException} When booking not found
   * @throws {BadRequestException} When update is not allowed
   */
  update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity>;

  /**
   * Cancel booking
   * @param id - Booking ID
   * @param cancelBookingDto - Cancellation data
   * @returns Promise<BookingEntity> - Cancelled booking
   * @throws {NotFoundException} When booking not found
   * @throws {BadRequestException} When cancellation is not allowed
   */
  cancel(id: string, cancelBookingDto: CancelBookingDto): Promise<BookingEntity>;

  /**
   * Delete booking
   * @param id - Booking ID
   * @returns Promise<void>
   * @throws {NotFoundException} When booking not found
   */
  delete(id: string): Promise<void>;

  /**
   * Confirm booking
   * @param id - Booking ID
   * @returns Promise<BookingEntity> - Confirmed booking
   * @throws {NotFoundException} When booking not found
   * @throws {BadRequestException} When confirmation is not allowed
   */
  confirm(id: string): Promise<BookingEntity>;

  /**
   * Complete booking
   * @param id - Booking ID
   * @returns Promise<BookingEntity> - Completed booking
   * @throws {NotFoundException} When booking not found
   * @throws {BadRequestException} When completion is not allowed
   */
  complete(id: string): Promise<BookingEntity>;

  /**
   * Get booking statistics
   * @param partnerId - Optional partner ID for filtering
   * @returns Promise<object> - Booking statistics
   */
  getStatistics(partnerId?: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }>;

  /**
   * Check booking availability
   * @param serviceId - Service ID
   * @param startTime - Start time
   * @param endTime - End time
   * @param excludeBookingId - Booking ID to exclude from check
   * @returns Promise<boolean> - True if available
   */
  checkAvailability(serviceId: string, startTime: Date, endTime: Date, excludeBookingId?: string): Promise<boolean>;
}
