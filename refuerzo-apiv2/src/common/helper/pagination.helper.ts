import { BadRequestException } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export function buildPaginationAndFilterOptions<T>(
  repository: Repository<T>,
  page: number,
  limit: number,
  sort: 'asc' | 'desc',
  orderedBy: string,
  includeDeleted: boolean,
  filterBy?: string,
  filterValue?: any,
  filter?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'ne' | 'like',
): FindManyOptions<T> {
  validatePaginationQuery<T>(orderedBy, filterBy, repository);

  // Validate and calculate pagination details
  const queryOptions: FindManyOptions<T> = {
    skip: (page - 1) * limit,
    take: limit,
    order: {
      [orderedBy]: sort === 'asc' ? 'ASC' : 'DESC',
    } as FindOptionsOrder<T>,
    where: {} as FindOptionsWhere<T>,
    withDeleted: includeDeleted,
  };

  // Apply soft delete filter
  if (!includeDeleted) {
    (queryOptions.where as any).deletedAt = null;
  }

  // Apply dynamic filtering if provided
  if (filterBy && filterValue) {
    const filterCondition: any = {};
    filterCondition[filterBy] = getFilterObject(filter, filterValue);

    // Merge dynamic filter conditions with existing where clause
    queryOptions.where = { ...queryOptions.where, ...filterCondition };
  }

  return queryOptions;
}

function validatePaginationQuery<T>(
  orderedBy: string, // Change to `any` to allow any object type
  filterBy: string,
  repository: Repository<T>,
) {
  const metadata = repository.metadata;
  const validKeys: (keyof T)[] = metadata.columns.map(
    (column) => column.propertyName,
  ) as (keyof T)[];

  if (validKeys) {
    if (orderedBy && !validKeys.includes(orderedBy as keyof T)) {
      throw new BadRequestException(`Invalid orderedBy field: ${orderedBy}`);
    }
    if (filterBy && !validKeys.includes(orderedBy as keyof T)) {
      throw new BadRequestException(`Invalid filterBy field: ${filterBy}`);
    }
  }
}

function getFilterObject(
  filter: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'ne' | 'like',
  value: any,
) {
  switch (filter) {
    case 'eq':
      return value;
    case 'gt':
      return { $gt: value };
    case 'lt':
      return { $lt: value };
    case 'gte':
      return { $gte: value };
    case 'lte':
      return { $lte: value };
    case 'ne':
      return { $ne: value };
    case 'like':
      return { $regex: value, $options: 'i' }; // MongoDB regex for partial match
    default:
      return value;
  }
}
