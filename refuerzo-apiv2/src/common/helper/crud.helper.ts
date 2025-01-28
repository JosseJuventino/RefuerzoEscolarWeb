// src/common/helper/crud.helper.ts

import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { isValidObjectId } from './mongodb.helper';
import { ObjectId } from 'mongodb';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface BaseEntity {
  _id?: ObjectId; // Asegúrate de que _id sea opcional, ya que puede no estar presente al crear nuevas entidades
  deletedAt?: Date;
}

export class CrudHelper<T extends BaseEntity> {
  constructor(
    private readonly repository: Repository<T>,
    private readonly entityName: string,
  ) {}

  private getEntityName(): string {
    return this.entityName;
  }

  /**
   * Sobrecargas para el método findOne.
   */
  async findOne(
    condition: Partial<T>,
    throwIfNotFound?: boolean,
  ): Promise<T | undefined>;
  async findOne(
    options: FindOneOptions<T>,
    throwIfNotFound?: boolean,
  ): Promise<T | undefined>;
  async findOne(id: string, throwIfNotFound?: boolean): Promise<T | undefined>;

  /**
   * Implementación del método findOne que maneja diferentes tipos de entradas.
   */
  async findOne(
    arg: Partial<T> | FindOneOptions<T> | string,
    throwIfNotFound: boolean = true,
  ): Promise<T | undefined> {
    let entity: T | undefined;

    if (typeof arg === 'string') {
      // Si el argumento es una cadena, asumimos que es el ID
      if (!isValidObjectId(arg)) {
        if (throwIfNotFound) {
          throw new NotFoundException(
            `${this.getEntityName()} with id "${arg}" not found.`,
          );
        }
        return undefined;
      }
      entity = await this.repository.findOne({
        where: { _id: new ObjectId(arg) } as FindOptionsWhere<T>,
      });
    } else if ('where' in arg || 'relations' in arg || 'select' in arg) {
      // Si el argumento tiene propiedades propias de FindOneOptions, lo tratamos como tal
      entity = await this.repository.findOne(arg as FindOneOptions<T>);
    } else {
      // De lo contrario, tratamos el argumento como una condición parcial
      entity = await this.repository.findOne({
        where: arg as FindOptionsWhere<T>,
      });
    }

    if (!entity && throwIfNotFound) {
      throw new NotFoundException(`${this.getEntityName()} not found.`);
    }

    return entity;
  }

  async create(entity: T) {
    try {
      await this.repository.save(entity);
    } catch (error) {
      console.error(`Error in ${this.getEntityName()} create method:`, error);
      throw new InternalServerErrorException(
        `Failed to create ${this.getEntityName()}`,
      );
    }
  }

  async findWithPagination(
    queryOptions: FindManyOptions<T>,
  ): Promise<[T[], number, number]> {
    // Retrieve results and total count
    const [results, total] = await this.repository.findAndCount(queryOptions);
    const totalPages = Math.ceil(total / (queryOptions.take || 10));
    return [results, totalPages, total];
  }

  async CountAll(): Promise<number> {
    return await this.repository.count();
  }

  async findByNameOrId(
    code: string,
    includeDeleted = false,
    throwIfNotFound = true,
  ): Promise<T> {
    const query = isValidObjectId(code) // Valida si code es un ObjectId válido
      ? { _id: new ObjectId(code) }
      : { username: code };
    const entity = await this.repository.findOne({
      where: query as FindOptionsWhere<T>,
      // Nota: `withDeleted` no es una opción válida en TypeORM para MongoDB. Si usas soft deletes, necesitarás manejarlo de otra manera.
    });

    if (!entity && throwIfNotFound) {
      const entityName = this.getEntityName();
      throw new NotFoundException(`${entityName} not found.`);
    }

    return entity;
  }

  async update(entity: T, updateData: DeepPartial<T>): Promise<void> {
    try {
      this.repository.merge(entity, updateData);
      await this.repository.save(entity);
    } catch (error) {
      console.error(`Error in ${this.getEntityName()} update method:`, error);
      throw new InternalServerErrorException(
        `Failed to update ${this.getEntityName()}.`,
      );
    }
  }

  async delete(entity: T, purge: boolean): Promise<void> {
    try {
      if (purge) {
        await this.repository.remove(entity);
      } else {
        entity.deletedAt = new Date();
        await this.repository.save(entity);
      }
    } catch (error) {
      console.error(`Error in ${this.getEntityName()} delete method:`, error);
      throw new InternalServerErrorException(
        `Failed to delete ${this.getEntityName()}.`,
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      console.error(`Error in ${this.getEntityName()} count method:`, error);
      throw new InternalServerErrorException(
        `Failed to count ${this.getEntityName()}.`,
      );
    }
  }
}
