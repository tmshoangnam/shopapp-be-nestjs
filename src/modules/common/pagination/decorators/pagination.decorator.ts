import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationDto, PaginationMetaDto } from '../dto/pagination.dto';

export interface PaginationApiOptions {
  description?: string;
  searchable?: boolean;
  customSortFields?: string[];
  example?: any;
}

export function PaginationApi(options: PaginationApiOptions = {}) {
  const { description, searchable = false, customSortFields = [], example } = options;

  const decorators = [
    ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number }),
    ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number }),
    ApiQuery({ 
      name: 'sortBy', 
      required: false, 
      description: `Field to sort by. Default: 'createdAt'. Available: ${customSortFields.join(', ')}`, 
      type: String 
    }),
    ApiQuery({ 
      name: 'sortOrder', 
      required: false, 
      description: 'Sort order (asc/desc). Default: \'desc\'', 
      enum: ['asc', 'desc'] 
    }),
  ];

  if (searchable) {
    decorators.push(
      ApiQuery({ name: 'search', required: false, description: 'Search term', type: String })
    );
  }

  decorators.push(
    ApiResponse({
      status: 200,
      description: description || 'Paginated results retrieved successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: example || { type: 'object' },
              },
            },
          },
        ],
      },
    })
  );

  return applyDecorators(...decorators);
}

export function CursorPaginationApi(options: { description?: string; example?: any } = {}) {
  const { description, example } = options;
  return applyDecorators(
    ApiQuery({ name: 'take', required: true, description: 'Number of items to retrieve', type: Number }),
    ApiQuery({ name: 'cursor', required: false, description: 'The ID of the last item from the previous page', type: String }),
    ApiQuery({ name: 'orderBy', required: true, description: 'Field to order by (e.g., "createdAt")', type: String }),
    ApiQuery({ name: 'orderDirection', required: false, description: 'Order direction (asc/desc). Default: "asc"', enum: ['asc', 'desc'] }),
    ApiResponse({
      status: 200,
      description: description || 'Cursor-paginated results retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: example || { type: 'object' },
          },
          nextCursor: { type: 'string', nullable: true },
          hasMore: { type: 'boolean' },
        },
      },
    }),
  );
}

export function PaginatedResponseDto<T>(classRef: Type<T>) {
  class PaginatedResponseDto {
    @ApiProperty({ type: [classRef] })
    data: T[];

    @ApiProperty({ type: PaginationMetaDto })
    meta: PaginationMetaDto;
  }

  Object.defineProperty(PaginatedResponseDto, 'name', {
    value: `Paginated${classRef.name}ResponseDto`,
  });

  return PaginatedResponseDto;
}
