import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateSeccionDto } from '../dto/create-seccion.dto';
import { ObjectId } from 'mongodb';
import { UpdateSeccionDto } from '../dto/update-seccion.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Seccion } from '../entities/seccion.entity';
import { Repository, FindManyOptions, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { CONFIGURABLE_MODULE_ID } from '@nestjs/common/module-utils/constants';
import { Grado } from 'src/grado/entities/grado.entity';
import { Publicacion } from 'src/publicacion/entities/publicacion.entity';
import { PublicacionService } from 'src/publicacion/service/publicacion.service';

@Injectable()
export class SeccionService {
  private readonly crudHelper: CrudHelper<Seccion>;

  constructor(
    @InjectRepository(Seccion)
    private readonly SeccionRepository: Repository<Seccion>,
    @InjectRepository(Grado)
    private readonly GradoRepository: Repository<Grado>,
    @InjectRepository(Publicacion)
    private readonly PublicacionRepository: Repository<Publicacion>,
    private readonly publicacionService: PublicacionService,
  ) {
    this.crudHelper = new CrudHelper<Seccion>(
      this.SeccionRepository,
      'Secciones',
    );
  }

  async create(
    createSeccionDto: CreateSeccionDto,
  ): Promise<GeneralResponseDto<Seccion>> {
    const findSeccion = await this.crudHelper.findByNameOrId(
      createSeccionDto.nombre,
      false,
      false,
    );
    if (findSeccion) {
      throw new ConflictException(
        `Seccion with name ${createSeccionDto.nombre} already exists`,
      );
    }

    // Verificar existencia del Grado
    const gradoExists = await this.GradoRepository.findOne({
      where: { _id: new ObjectId(createSeccionDto.gradoId) },
    });
    if (!gradoExists) {
      throw new BadRequestException(
        `Grado with id ${createSeccionDto.gradoId} not found`,
      );
    }

    const newSeccion = this.SeccionRepository.create({
      ...createSeccionDto,
      gradoId: createSeccionDto.gradoId, // Almacenar como ObjectId
    });

    const savedSeccion = await this.SeccionRepository.save(newSeccion);

    return new GeneralResponseBuilder<Seccion>()
      .setStatusCode(201)
      .setMessage('Seccion created successfully')
      .setData(savedSeccion) // Incluir el objeto creado
      .build();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const filter: any = {};
    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i', // Insensible a mayúsculas
      };
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: Seccion[];
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

      [results, total] =
        await this.SeccionRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.SeccionRepository.find({
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

    return new PaginationResponseBuilder()
      .setMessage(`Seccions retrieved successfully. Total pages: ${totalPages}`)
      .setData(results)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Seccion>> {
    const findSeccion = await this.crudHelper.findByNameOrId(id);
    if (!findSeccion) {
      throw new BadRequestException(`Seccion with id ${id} not found`);
    }

    // Obtener todas las publicaciones de esta sección
    const publicaciones = await this.PublicacionRepository.find({
      where: { seccionId: findSeccion._id.toString() },
    });

    // Agregar las publicaciones al objeto de respuesta
    const seccionWithPublicaciones = {
      ...findSeccion,
      publicaciones,
    };

    return new GeneralResponseBuilder<Seccion>()
      .setMessage('Seccion retrieved successfully')
      .setData(seccionWithPublicaciones)
      .build();
  }

  async update(
    id: string,
    updateSeccionDto: UpdateSeccionDto,
  ): Promise<GeneralResponseDto<Seccion>> {
    const Seccion = await this.crudHelper.findByNameOrId(id);

    const updateData: DeepPartial<Seccion> = {
      ...updateSeccionDto,
    };
    await this.crudHelper.update(Seccion, updateData);
    return new GeneralResponseBuilder<Seccion>()
      .setMessage('Seccion updated successfully')
      .build();
  }

  async findAllByGradoId(gradoId: string): Promise<Seccion[]> {
    return this.SeccionRepository.find({
      where: { gradoId },
    });
  }

  async remove(id: string): Promise<GeneralResponseDto<Seccion>> {
    const seccion = await this.crudHelper.findByNameOrId(id);

    // Eliminar todas las publicaciones de la sección y sus archivos
    await this.publicacionService.deleteBySeccionId(seccion._id.toString());

    // Eliminar la sección
    await this.crudHelper.delete(seccion, true);

    return new GeneralResponseBuilder<Seccion>()
      .setMessage('Seccion deleted successfully')
      .build();
  }

  async deleteByGradoId(gradoId: string): Promise<void> {
    // Obtener todas las secciones del grado
    const secciones = await this.SeccionRepository.find({ where: { gradoId } });

    // Eliminar publicaciones y archivos de cada sección
    for (const seccion of secciones) {
      await this.publicacionService.deleteBySeccionId(seccion._id.toString());
    }

    // Eliminar todas las secciones del grado
    await this.SeccionRepository.delete({ gradoId });
  }
}
