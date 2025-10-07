import { BookingEntity } from '../entities';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from '../dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IBookingRepository {
  /**
   * Create a new booking
   * @param createBookingDto - Booking creation data
   * @returns Promise<BookingEntity> - Created booking
   */
  create(createBookingDto: CreateBookingDto): Promise<BookingEntity>;

  /**
   * Find booking by ID
   * @param id - Booking ID
   * @returns Promise<BookingEntity | null> - Found booking or null
   */
  findById(id: string): Promise<BookingEntity | null>;

  /**
   * Find bookings by user ID
   * @param userId - User ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - User's bookings
   */
  findByUserId(userId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Find bookings by service ID
   * @param serviceId - Service ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Service bookings
   */
  findByServiceId(serviceId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Find bookings by partner ID
   * @param partnerId - Partner ID
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Partner bookings
   */
  findByPartnerId(partnerId: string, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Find all bookings with filters
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Filtered bookings
   */
  findAll(options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;

  /**
   * Update booking
   * @param id - Booking ID
   * @param updateBookingDto - Update data
   * @returns Promise<BookingEntity> - Updated booking
   */
  update(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity>;

  /**
   * Cancel booking
   * @param id - Booking ID
   * @param cancellationReason - Reason for cancellation
   * @returns Promise<BookingEntity> - Cancelled booking
   */
  cancel(id: string, cancellationReason: string): Promise<BookingEntity>;

  /**
   * Delete booking (soft delete)
   * @param id - Booking ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>;

  /**
   * Check if booking exists
   * @param id - Booking ID
   * @returns Promise<boolean> - True if exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count bookings by status
   * @param status - Booking status
   * @returns Promise<number> - Count of bookings
   */
  countByStatus(status: string): Promise<number>;

  /**
   * Find bookings by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param options - Query options
   * @returns Promise<PaginatedResult<BookingEntity>> - Bookings in date range
   */
  findByDateRange(startDate: Date, endDate: Date, options?: QueryBookingDto): Promise<PaginatedResult<BookingEntity>>;
}
