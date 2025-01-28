import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  // Todo: Documentation
  statusCode: number;
  message: string;
  @ApiProperty({
    description: 'Data',
    type: [Object],
  })
  data: T[];

  @ApiProperty({
    description: 'Size of elements in the array',
    type: Number,
  })
  size: number;

  @ApiProperty({
    description: 'Total number of pages',
    type: Number,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page',
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    type: Number,
  })
  limit: number;
}
