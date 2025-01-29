import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateRecomendadorDto } from '../dto/create-recomendador.dto';
import { ObjectId } from 'mongodb';
import { UpdateRecomendadorDto } from '../dto/update-recomendador.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Recomendador } from '../entities/recomendador.entity';
import { Repository, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { CONFIGURABLE_MODULE_ID } from '@nestjs/common/module-utils/constants';

@Injectable()
export class RecomendadorService {
  private readonly crudHelper: CrudHelper<Recomendador>;
  constructor(
    @InjectRepository(Recomendador)
    private readonly recomendadorRepository: Repository<Recomendador>,
  ) {
    this.crudHelper = new CrudHelper<Recomendador>(
      this.recomendadorRepository,
      'Recomendadores',
    );
  }
  async create(
    createRecomendadorDto: CreateRecomendadorDto,
  ): Promise<GeneralResponseDto<Recomendador>> {
    const findRecomendador = await this.crudHelper.findByNameOrId(
      createRecomendadorDto.nombre,
      false,
      false,
    );
    if (findRecomendador) {
      throw new ConflictException(
        `Recomendador with username ${createRecomendadorDto.nombre} already exists`,
      );
    }

    // Crear un nuevo recomendador asegurando que el contacto se guarde correctamente
    const newRecomendador = this.recomendadorRepository.create({
      nombre: createRecomendadorDto.nombre,
      imagen: createRecomendadorDto.imagen,
      contacto: createRecomendadorDto.contacto, // Asegúrate de que el contacto se incluya aquí
      isActive: createRecomendadorDto.isActive,
    });

    await this.crudHelper.create(newRecomendador);
    return new GeneralResponseBuilder<Recomendador>()
      .setStatusCode(201)
      .setMessage('Recomendador created successfully')
      .build();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const filter: any = {};
    // Agregar filtros adicionales si existen
    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i', // Insensible a mayúsculas
      };
    }

    // Determinar si se aplica paginación
    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: Recomendador[];
    let total: number;
    let totalPages: number;

    if (applyPagination) {
      const queryOptions = {
        skip: (paginationQuery.page - 1) * paginationQuery.limit,
        take: paginationQuery.limit,
        where: filter,
        order:
          paginationQuery.orderedBy && paginationQuery.sort
            ? {
                [paginationQuery.orderedBy]:
                  paginationQuery.sort.toUpperCase() as 'ASC' | 'DESC',
              }
            : undefined,
        withDeleted: paginationQuery.includeDeleted,
      };

      // Obtener los resultados con paginación
      [results, total] =
        await this.recomendadorRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.recomendadorRepository.find({
        where: filter,
        order:
          paginationQuery.orderedBy && paginationQuery.sort
            ? {
                [paginationQuery.orderedBy]:
                  paginationQuery.sort.toUpperCase() as 'ASC' | 'DESC',
              }
            : undefined,
        withDeleted: paginationQuery.includeDeleted,
      });

      total = results.length;
      totalPages = 1;
    }

    // Construir la respuesta paginada
    return new PaginationResponseBuilder()
      .setMessage(
        `Postulantes retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(results)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Recomendador>> {
    const findPostulante = await this.crudHelper.findByNameOrId(id);
    if (!findPostulante) {
      throw new BadRequestException(`Recomendador with id ${id} not found`);
    }
    return new GeneralResponseBuilder<Recomendador>()
      .setMessage('Recomendador retrieved successfully')
      .setData(findPostulante)
      .build();
  }

  async update(
    id: string,
    updateRecomendadorDto: UpdateRecomendadorDto,
  ): Promise<GeneralResponseDto<Recomendador>> {
    const Recomendador = await this.crudHelper.findByNameOrId(id);

    await this.crudHelper.update(Recomendador, updateRecomendadorDto);
    return new GeneralResponseBuilder<Recomendador>()
      .setMessage('Recomendador updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Recomendador>> {
    const Recomendador = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.delete(Recomendador, true);
    return new GeneralResponseBuilder<Recomendador>()
      .setMessage('Recomendador deleted successfully')
      .build();
  }
}
