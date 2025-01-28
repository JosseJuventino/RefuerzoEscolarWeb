import { Module } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { GeneralResponseDto } from './dto/general-response.dto';
import { PurgeDto } from './dto/purge.dto';

@Module({
  imports: [
    PaginationQueryDto,
    PaginationResponseDto,
    GeneralResponseDto,
    PurgeDto,
  ],
  exports: [
    PaginationQueryDto,
    PaginationResponseDto,
    GeneralResponseDto,
    PurgeDto,
  ],
})
export class CommonModule {}
