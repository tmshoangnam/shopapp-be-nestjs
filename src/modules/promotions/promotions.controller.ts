import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionResponseDto,
  PromotionUsageResponseDto,
  PromotionStatsResponseDto,
  PaginatedPromotionResponseDto,
  ApplyPromotionDto,
  ValidatePromotionDto,
  PromotionValidationResponseDto,
  AvailablePromotionsDto,
} from './dto';

/**
 * Controller for managing promotion operations
 * @class PromotionsController
 */
@ApiTags('promotions')
@Controller('promotions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Create a new promotion
   * @param createPromotionDto - Promotion creation data
   * @returns Promise<PromotionResponseDto>
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new promotion',
    description: 'Creates a new promotional campaign with the provided information',
  })
  @ApiBody({
    type: CreatePromotionDto,
    description: 'Promotion creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Promotion created successfully',
    type: PromotionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Promotion code already exists',
  })
  async create(@Body() createPromotionDto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const promotion = await this.promotionsService.create(createPromotionDto);
    return this.mapToResponseDto(promotion);
  }

  /**
   * Get all promotions with pagination and filtering
   * @param options - Query options
   * @returns Promise<PaginatedPromotionResponseDto>
   */
  @Get()
  @ApiOperation({
    summary: 'Get all promotions',
    description: 'Retrieves a paginated list of promotions with optional filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'targetType', required: false, enum: ['ALL', 'USER', 'SERVICE', 'PARTNER', 'CATEGORY'], description: 'Filter by target type' })
  @ApiQuery({ name: 'type', required: false, enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y'], description: 'Filter by promotion type' })
  @ApiResponse({
    status: 200,
    description: 'Promotions retrieved successfully',
    type: PaginatedPromotionResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('isActive') isActive?: boolean,
    @Query('targetType') targetType?: string,
    @Query('type') type?: string,
  ): Promise<PaginatedPromotionResponseDto> {
    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      sortBy,
      sortOrder,
      isActive,
      targetType: targetType as any,
      type: type as any,
    };

    const result = await this.promotionsService.findAll(options);
    
    return {
      data: result.data.map(promotion => this.mapToResponseDto(promotion)),
      meta: result.meta,
    };
  }

  /**
   * Get promotion by ID
   * @param id - Promotion ID
   * @returns Promise<PromotionResponseDto>
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get promotion by ID',
    description: 'Retrieves a specific promotion by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion retrieved successfully',
    type: PromotionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async findOne(@Param('id') id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promotionsService.findById(id);
    return this.mapToResponseDto(promotion);
  }

  /**
   * Update promotion
   * @param id - Promotion ID
   * @param updatePromotionDto - Update data
   * @returns Promise<PromotionResponseDto>
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update promotion',
    description: 'Updates an existing promotion with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiBody({
    type: UpdatePromotionDto,
    description: 'Promotion update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion updated successfully',
    type: PromotionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    const promotion = await this.promotionsService.update(id, updatePromotionDto);
    return this.mapToResponseDto(promotion);
  }

  /**
   * Delete promotion
   * @param id - Promotion ID
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete promotion',
    description: 'Deletes a promotion permanently',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Promotion deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.promotionsService.delete(id);
  }

  /**
   * Activate promotion
   * @param id - Promotion ID
   * @returns Promise<PromotionResponseDto>
   */
  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate promotion',
    description: 'Activates a promotion',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion activated successfully',
    type: PromotionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async activate(@Param('id') id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promotionsService.activate(id);
    return this.mapToResponseDto(promotion);
  }

  /**
   * Deactivate promotion
   * @param id - Promotion ID
   * @returns Promise<PromotionResponseDto>
   */
  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate promotion',
    description: 'Deactivates a promotion',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion deactivated successfully',
    type: PromotionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async deactivate(@Param('id') id: string): Promise<PromotionResponseDto> {
    const promotion = await this.promotionsService.deactivate(id);
    return this.mapToResponseDto(promotion);
  }

  /**
   * Validate promotion
   * @param validatePromotionDto - Validation data
   * @returns Promise<PromotionValidationResponseDto>
   */
  @Post('validate')
  @ApiOperation({
    summary: 'Validate promotion',
    description: 'Validates a promotion code for a user and order amount',
  })
  @ApiBody({
    type: ValidatePromotionDto,
    description: 'Promotion validation data',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion validation completed',
    type: PromotionValidationResponseDto,
  })
  async validatePromotion(
    @Body() validatePromotionDto: ValidatePromotionDto,
  ): Promise<PromotionValidationResponseDto> {
    const result = await this.promotionsService.validatePromotion(
      validatePromotionDto.code,
      validatePromotionDto.userId,
      validatePromotionDto.orderAmount,
    );

    return {
      isValid: result.isValid,
      promotion: result.promotion ? {
        id: result.promotion.id,
        code: result.promotion.code,
        name: result.promotion.name,
        type: result.promotion.type,
        value: result.promotion.value,
        minOrderAmount: result.promotion.minOrderAmount,
        maxDiscountAmount: result.promotion.maxDiscountAmount,
      } : undefined,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      errors: result.errors,
    };
  }

  /**
   * Apply promotion
   * @param applyPromotionDto - Application data
   * @returns Promise<PromotionUsageResponseDto>
   */
  @Post('apply')
  @ApiOperation({
    summary: 'Apply promotion',
    description: 'Applies a promotion to an order and creates usage record',
  })
  @ApiBody({
    type: ApplyPromotionDto,
    description: 'Promotion application data',
  })
  @ApiResponse({
    status: 201,
    description: 'Promotion applied successfully',
    type: PromotionUsageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Promotion validation failed',
  })
  async applyPromotion(
    @Body() applyPromotionDto: ApplyPromotionDto,
  ): Promise<PromotionUsageResponseDto> {
    const result = await this.promotionsService.applyPromotion(
      applyPromotionDto.code,
      applyPromotionDto.userId,
      applyPromotionDto.bookingId || '',
      applyPromotionDto.orderAmount,
    );

    if (!result.success || !result.usage) {
      throw new Error(result.errors?.join(', ') || 'Failed to apply promotion');
    }

    return {
      id: result.usage.id,
      promotionId: result.usage.promotionId,
      userId: result.usage.userId,
      bookingId: result.usage.bookingId,
      discountAmount: result.usage.discountAmount,
      originalAmount: result.usage.originalAmount,
      finalAmount: result.usage.finalAmount,
      createdAt: result.usage.createdAt,
    };
  }

  /**
   * Get available promotions for user
   * @param availablePromotionsDto - Query data
   * @returns Promise<PromotionResponseDto[]>
   */
  @Post('available')
  @ApiOperation({
    summary: 'Get available promotions',
    description: 'Retrieves promotions available for a specific user and order amount',
  })
  @ApiBody({
    type: AvailablePromotionsDto,
    description: 'Available promotions query data',
  })
  @ApiResponse({
    status: 200,
    description: 'Available promotions retrieved successfully',
    type: [PromotionResponseDto],
  })
  async getAvailablePromotions(
    @Body() availablePromotionsDto: AvailablePromotionsDto,
  ): Promise<PromotionResponseDto[]> {
    const promotions = await this.promotionsService.getAvailablePromotions(
      availablePromotionsDto.userId,
      availablePromotionsDto.orderAmount,
    );

    return promotions.map(promotion => this.mapToResponseDto(promotion));
  }

  /**
   * Get promotion statistics
   * @param id - Promotion ID
   * @returns Promise<PromotionStatsResponseDto>
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get promotion statistics',
    description: 'Retrieves usage statistics for a specific promotion',
  })
  @ApiParam({
    name: 'id',
    description: 'Promotion ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion statistics retrieved successfully',
    type: PromotionStatsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Promotion not found',
  })
  async getPromotionStats(@Param('id') id: string): Promise<PromotionStatsResponseDto> {
    const stats = await this.promotionsService.getPromotionStats(id);
    
    return {
      promotionId: stats.promotionId,
      totalUsage: stats.totalUsage,
      totalDiscountGiven: stats.totalDiscountGiven,
      totalRevenue: stats.totalRevenue,
      uniqueUsers: stats.uniqueUsers,
      conversionRate: stats.conversionRate,
      averageOrderValue: stats.averageOrderValue,
    };
  }

  /**
   * Map promotion entity to response DTO
   * @param promotion - Promotion entity
   * @returns PromotionResponseDto
   */
  private mapToResponseDto(promotion: any): PromotionResponseDto {
    const now = new Date();
    const isValid = promotion.isActive &&
      promotion.startDate <= now &&
      (!promotion.endDate || promotion.endDate >= now) &&
      (!promotion.usageLimit || promotion.usedCount < promotion.usageLimit);

    const remainingUsage = promotion.usageLimit 
      ? promotion.usageLimit - promotion.usedCount 
      : undefined;

    return {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount,
      maxDiscountAmount: promotion.maxDiscountAmount,
      usageLimit: promotion.usageLimit,
      usedCount: promotion.usedCount,
      userUsageLimit: promotion.userUsageLimit,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
      targetType: promotion.targetType,
      targetIds: promotion.targetIds,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
      createdBy: promotion.createdBy,
      isValid,
      remainingUsage,
    };
  }
}
