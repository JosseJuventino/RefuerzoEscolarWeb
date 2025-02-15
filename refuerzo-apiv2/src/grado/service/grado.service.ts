import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateGradoDto } from '../dto/create-grado.dto';
import { ObjectId } from 'mongodb';
import { UpdateGradoDto } from '../dto/update-grado.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Grado } from '../entities/grado.entity';
import { Repository, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { SeccionService } from 'src/seccion/service/seccion.service';

@Injectable()
export class GradoService {
  private readonly crudHelper: CrudHelper<Grado>;

  constructor(
    @InjectRepository(Grado)
    private readonly gradoRepository: Repository<Grado>,
    private readonly seccionService: SeccionService,
  ) {
    this.crudHelper = new CrudHelper<Grado>(this.gradoRepository, 'Grados');
  }

  async create(
    createGradoDto: CreateGradoDto,
  ): Promise<GeneralResponseDto<Grado>> {
    const findGrado = await this.crudHelper.findByNameOrId(
      createGradoDto.nombre,
      false,
      false,
    );
    if (findGrado) {
      throw new ConflictException(
        `Grado with name ${createGradoDto.nombre} already exists`,
      );
    }

    // Crear un nuevo grado
    const newGrado = this.gradoRepository.create({
      nombre: createGradoDto.nombre,
    });

    // Guardar el grado en la base de datos para obtener su _id
    const savedGrado = await this.gradoRepository.save(newGrado);

    // Crear una sección por defecto para el grado
    await this.seccionService.create({
      nombre: `Matematicas - ${savedGrado.nombre}`,
      gradoId: savedGrado._id.toString(),
      encargados: [],
      alumnos: [],
      backgroundImage: '',
    });

    return new GeneralResponseBuilder<Grado>()
      .setStatusCode(201)
      .setMessage('Grado created successfully')
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

    let results: Grado[];
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
      .setMessage(`Grados retrieved successfully. Total pages: ${totalPages}`)
      .setData(results)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Grado>> {
    const findPostulante = await this.crudHelper.findByNameOrId(id);
    if (!findPostulante) {
      throw new BadRequestException(`Grado with id ${id} not found`);
    }
    return new GeneralResponseBuilder<Grado>()
      .setMessage('Grado retrieved successfully')
      .setData(findPostulante)
      .build();
  }

  async update(
    id: string,
    updateGradoDto: UpdateGradoDto,
  ): Promise<GeneralResponseDto<Grado>> {
    const existingGrado = await this.crudHelper.findByNameOrId(id);
    const oldNombre = existingGrado.nombre;

    // Actualizar el Grado
    await this.crudHelper.update(existingGrado, updateGradoDto);

    // Si se modificó el nombre del grado
    if (updateGradoDto.nombre && updateGradoDto.nombre !== oldNombre) {
      // Obtener todas las secciones relacionadas
      const secciones = await this.seccionService.findAllByGradoId(id);

      // Actualizar cada sección
      for (const seccion of secciones) {
        // Extraer el tema (parte antes del " - ") y combinar con el nuevo nombre del grado
        const [tema] = seccion.nombre.split(' - '); // Divide el nombre en el primer " - "
        const newSeccionNombre = `${tema} - ${updateGradoDto.nombre}`; // Usa el tema y el nuevo nombre
        await this.seccionService.update(seccion._id.toString(), {
          nombre: newSeccionNombre,
        });
      }
    }

    return new GeneralResponseBuilder<Grado>()
      .setMessage('Grado updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Grado>> {
    const Grado = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.delete(Grado, true);
    await this.seccionService.deleteByGradoId(id);

    return new GeneralResponseBuilder<Grado>()
      .setMessage('Grado deleted successfully')
      .build();
  }
}
