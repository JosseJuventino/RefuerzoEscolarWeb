import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateProgramaDto } from '../dto/create-programa.dto';
import { ObjectId } from 'mongodb';
import { UpdateProgramaDto } from '../dto/update-programa.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Programa } from '../entities/programa.entity';
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
export class ProgramaService {
  private readonly crudHelper: CrudHelper<Programa>;

  constructor(
    @InjectRepository(Programa)
    private readonly gradoRepository: Repository<Programa>,
  ) {
    this.crudHelper = new CrudHelper<Programa>(
      this.gradoRepository,
      'Programas',
    );
  }

  async create(
    createProgramaDto: CreateProgramaDto,
  ): Promise<GeneralResponseDto<Programa>> {
    const findGrado = await this.crudHelper.findByNameOrId(
      createProgramaDto.nombre,
      false,
      false,
    );
    if (findGrado) {
      throw new ConflictException(
        `Programa with username ${createProgramaDto.nombre} already exists`,
      );
    }

    const newPrograma = this.gradoRepository.create({
      nombre: createProgramaDto.nombre,
    });

    await this.crudHelper.create(newPrograma);

    return new GeneralResponseBuilder<Programa>()
      .setStatusCode(201)
      .setMessage('Programa created successfully')
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

    let results: Programa[];
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
      [results, total] = await this.gradoRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.gradoRepository.find({
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
        `Programas retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(results)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Programa>> {
    const findPostulante = await this.crudHelper.findByNameOrId(id);
    if (!findPostulante) {
      throw new BadRequestException(`Programa with id ${id} not found`);
    }
    return new GeneralResponseBuilder<Programa>()
      .setMessage('Programa retrieved successfully')
      .setData(findPostulante)
      .build();
  }

  async update(
    id: string,
    updateProgramaDto: UpdateProgramaDto,
  ): Promise<GeneralResponseDto<Programa>> {
    const Programa = await this.crudHelper.findByNameOrId(id);

    await this.crudHelper.update(Programa, updateProgramaDto);
    return new GeneralResponseBuilder<Programa>()
      .setMessage('Programa updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Programa>> {
    const Programa = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.delete(Programa, true);
    return new GeneralResponseBuilder<Programa>()
      .setMessage('Programa deleted successfully')
      .build();
  }
}
