import { HttpStatus } from '@nestjs/common';
import { PaginationResponseDto } from '../dto/pagination-response.dto';

export class PaginationResponseBuilder<T> {
  private response: PaginationResponseDto<T> = new PaginationResponseDto<T>();

  constructor(
    data: T[] = [],
    size: number = 0,
    page: number = 1,
    limit: number = 10,
  ) {
    this.response.statusCode = HttpStatus.OK; // default status
    this.response.message = '';
    this.response.data = data;
    this.response.size = size;
    this.response.totalPages = 0;
    this.response.page = page;
    this.response.limit = limit;
  }

  setSize(size: number): this {
    this.response.size = size;
    return this;
  }

  setData(data: T[]): this {
    this.response.data = data;
    return this;
  }

  setPage(page: number): this {
    this.response.page = page;
    return this;
  }

  setLimit(limit: number): this {
    this.response.limit = limit;
    return this;
  }

  setStatusCode(statusCode: number): this {
    this.response.statusCode = statusCode;
    return this;
  }

  setMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  setTotalPages(totalPages: number): this {
    this.response.totalPages = totalPages;
    return this;
  }

  build(): PaginationResponseDto<T> {
    return this.response;
  }
}
