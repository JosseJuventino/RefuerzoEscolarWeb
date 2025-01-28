// dto/pagination-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Current page',
    required: false,
    example: 1,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    required: false,
    example: 10,
  })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Sort by field',
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: `Sort must be one of the following values: asc, desc`,
  })
  sort?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Field to order by',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  orderedBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Field to filter by',
    required: false,
    default: '',
  })
  @IsOptional()
  @IsString()
  filterBy?: string = '';

  @ApiProperty({
    description: 'Value to filter by',
    required: false,
    default: '',
  })
  @IsOptional()
  @IsString()
  filterValue?: string = '';

  @ApiProperty({
    description: 'Filter type',
    required: false,
    default: 'like',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['eq', 'gt', 'lt', 'gte', 'lte', 'ne', 'like'], {
    message: `Filter must be one of the following values: eq, gt, lt, gte, lte, ne, like`,
  })
  filter?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'ne' | 'like' = 'like';

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean = false;
}
