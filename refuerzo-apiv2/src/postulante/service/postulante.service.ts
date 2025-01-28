import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostulanteDto } from '../dto/create-postulante.dto';
import { ObjectId } from 'mongodb';
import { UpdatePostulanteDto } from '../dto/update-postulante.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Postulante } from '../entities/postulante.entity';
import { Repository, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';

@Injectable()
export class PostulanteService {
  private readonly crudHelper: CrudHelper<Postulante>;
  constructor(
    @InjectRepository(Postulante)
    private readonly postulanteRepository: Repository<Postulante>,
  ) {
    this.crudHelper = new CrudHelper<Postulante>(
      this.postulanteRepository,
      'Postulantes',
    );
  }
  async create(
    createPostulanteDto: CreatePostulanteDto,
  ): Promise<GeneralResponseDto<Postulante>> {
    const findPostulante = await this.crudHelper.findByNameOrId(
      createPostulanteDto.nombre,
      false,
      false,
    );
    if (findPostulante) {
      throw new ConflictException(
        `Postulante with name ${createPostulanteDto.nombre} already exists`,
      );
    }

    const newPostulante = this.postulanteRepository.create({
      ...createPostulanteDto,
    });
    await this.crudHelper.create(newPostulante);
    return new GeneralResponseBuilder<Postulante>()
      .setStatusCode(201)
      .setMessage('Postulante created successfully')
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

    let results: Postulante[];
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
        await this.postulanteRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.postulanteRepository.find({
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

  async findOne(id: string): Promise<GeneralResponseDto<Postulante>> {
    const findPostulante = await this.crudHelper.findByNameOrId(id);
    if (!findPostulante) {
      throw new BadRequestException(`Postulante with id ${id} not found`);
    }
    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante retrieved successfully')
      .setData(findPostulante)
      .build();
  }

  async update(
    id: string,
    updatePostulanteDto: UpdatePostulanteDto,
  ): Promise<GeneralResponseDto<Postulante>> {
    const Postulante = await this.crudHelper.findByNameOrId(id);

    await this.crudHelper.update(Postulante, updatePostulanteDto);
    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Postulante>> {
    const Postulante = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.delete(Postulante, true);
    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante deleted successfully')
      .build();
  }
}
