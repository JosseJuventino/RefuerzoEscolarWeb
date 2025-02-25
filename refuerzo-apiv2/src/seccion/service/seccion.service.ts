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
import { Repository, FindManyOptions, DeepPartial, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { Grado } from 'src/grado/entities/grado.entity';
import { Publicacion } from 'src/publicacion/entities/publicacion.entity';
import { PublicacionService } from 'src/publicacion/service/publicacion.service';
import { InternalUpdateSeccionDto } from '../dto/Internal-update-seccion.dto';
import { User } from 'src/users/entities/user.entity';
import { Alumno } from 'src/alumno/entities/alumno.entity';

@Injectable()
export class SeccionService {
  private readonly crudHelper: CrudHelper<Seccion>;
  private readonly userCrudHelper: CrudHelper<User>;
  private readonly alumnoCrudHelper: CrudHelper<Alumno>;

  constructor(
    @InjectRepository(Seccion)
    private readonly SeccionRepository: Repository<Seccion>,
    @InjectRepository(Grado)
    private readonly GradoRepository: Repository<Grado>,
    @InjectRepository(Publicacion)
    private readonly PublicacionRepository: Repository<Publicacion>,
    private readonly publicacionService: PublicacionService,
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {
    this.crudHelper = new CrudHelper<Seccion>(
      this.SeccionRepository,
      'Secciones',
    );
    this.userCrudHelper = new CrudHelper<User>(this.UserRepository, 'Users');
    this.alumnoCrudHelper = new CrudHelper<Alumno>(
      this.alumnoRepository,
      'Alumnos',
    );
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase() // Convertir a minúsculas
      .normalize('NFD') // Normalizar caracteres (eliminar acentos)
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9-]/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
      .replace(/-+/g, '-') // Eliminar múltiples guiones consecutivos
      .replace(/^-|-$/g, ''); // Eliminar guiones al inicio y al final
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

    const slug = this.generateSlug(createSeccionDto.nombre);

    const newSeccion = this.SeccionRepository.create({
      ...createSeccionDto,
      gradoId: createSeccionDto.gradoId, // Almacenar como ObjectId
      slug: slug,
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

    const seccionWithEncargados = await Promise.all(
      results.map(async (seccion) => {
        let encargados = [];
        if (seccion.encargados && seccion.encargados.length > 0) {
          encargados = await Promise.all(
            seccion.encargados.map(async (encargadoId) => {
              const encargado = await this.userCrudHelper.findByNameOrId(
                encargadoId.toString(),
                false,
                false,
              );
              return encargado
                ? {
                    _id: encargado._id,
                    nombre: encargado.nombre,
                    image: encargado.image,
                    email: encargado.email,
                    telefono: encargado.telefono,
                  }
                : null;
            }),
          );
        }

        const grado = await this.GradoRepository.findOne({
          where: { _id: new ObjectId(seccion.gradoId) },
        });

        return {
          _id: seccion._id,
          nombre: seccion.nombre,
          gradoId: grado.nombre,
          backgroundImage: seccion.backgroundImage,
          encargados: encargados.filter((encargado) => encargado !== null), // Filtra cualquier encargado nulo
          slug: seccion.slug,
        };
      }),
    );

    return new PaginationResponseBuilder()
      .setMessage(`Seccions retrieved successfully. Total pages: ${totalPages}`)
      .setData(seccionWithEncargados)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Seccion>> {
    // Buscar la sección por ID
    const findSeccion = await this.crudHelper.findByNameOrId(id);
    if (!findSeccion) {
      throw new BadRequestException(`Seccion with id ${id} not found`);
    }

    // Obtener todas las publicaciones de esta sección
    const publicaciones = await this.PublicacionRepository.find({
      where: { seccionId: findSeccion._id.toString() },
    });

    // Populate encargados (si existen)
    let encargados = [];
    if (findSeccion.encargados && findSeccion.encargados.length > 0) {
      encargados = await Promise.all(
        findSeccion.encargados.map(async (encargadoId) => {
          const encargado = await this.userCrudHelper.findByNameOrId(
            encargadoId.toString(),
            false,
            false,
          );
          return encargado
            ? {
                _id: encargado._id,
                nombre: encargado.nombre,
                image: encargado.image,
                email: encargado.email,
              telefono: encargado.telefono,
                
              }
            : null;
        }),
      );
    }

    //populate alumnos (si existen)
    let alumnos = [];
    if (findSeccion.alumnos && findSeccion.alumnos.length > 0) {
      alumnos = await Promise.all(
        findSeccion.alumnos.map(async (alumnoId) => {
          const alumno = await this.alumnoCrudHelper.findByNameOrId(
            alumnoId.toString(),
            false,
            false,
          );
          return alumno
            ? {
                _id: alumno._id,
                nombre: alumno.nombre,
                image: alumno.image,
              }
            : null;
        }),
      );
    }

    // Crear el objeto de respuesta con las publicaciones y los encargados populados
    const seccionWithDetails = {
      ...findSeccion,
      publicaciones,
      encargados: encargados.filter((encargado) => encargado !== null), // Filtramos encargados nulos
      alumnos: alumnos.filter((alumno) => alumno !== null), // Filtramos alumnos nulos
    };

    return new GeneralResponseBuilder<Seccion>()
      .setMessage('Seccion retrieved successfully')
      .setData(seccionWithDetails)
      .build();
  }

  async findOneBySlug(slug: string): Promise<GeneralResponseDto<Seccion>> {
    const seccion = await this.SeccionRepository.findOne({ where: { slug } });

    if (!seccion) {
      throw new BadRequestException(`Sección con slug "${slug}" no encontrada`);
    }

    const publicaciones = await this.PublicacionRepository.find({
      where: { seccionId: seccion._id.toString() },
    });

    const grado = await this.GradoRepository.findOne({
      where: { _id: new ObjectId(seccion.gradoId) },
    });

   
    // Populate encargados (si existen)
    let encargados = [];
    if (seccion.encargados && seccion.encargados.length > 0) {
      encargados = await Promise.all(
        seccion.encargados.map(async (encargadoId) => {
          const encargado = await this.userCrudHelper.findByNameOrId(
            encargadoId.toString(),
            false,
            false,
          );
          return encargado
            ? {
                _id: encargado._id,
                nombre: encargado.nombre,
                image: encargado.image,
                email: encargado.email,
              telefono: encargado.telefono,
                
              }
            : null;
        }),
      );
    }



    //populate alumnos (si existen)
    let alumnos = [];
    if (seccion.alumnos && seccion.alumnos.length > 0) {
      alumnos = await Promise.all(
        seccion.alumnos.map(async (alumnoId) => {
          const alumno = await this.alumnoCrudHelper.findByNameOrId(
            alumnoId.toString(),
            false,
            false,
          );
          return alumno
            ? {
                _id: alumno._id,
                nombre: alumno.nombre,
                image: alumno.image,
              }
            : null;
        }),
      );
    }

    // Crear el objeto de respuesta con las publicaciones y los encargados populados
    const seccionWithDetails = {
      ...seccion,
      publicaciones,
      encargados: encargados.filter((encargado) => encargado !== null), // Filtramos encargados nulos
      alumnos: alumnos.filter((alumno) => alumno !== null), // Filtramos alumnos nulos
    };

    return new GeneralResponseBuilder<Seccion>()
      .setMessage('Sección encontrada exitosamente')
      .setData(seccionWithDetails)
      .build();
  }

  async update(
    id: string,
    updateSeccionDto: UpdateSeccionDto,
  ): Promise<GeneralResponseDto<Seccion>> {
    const Seccion = await this.crudHelper.findByNameOrId(id);

    const internalUpdateData: InternalUpdateSeccionDto = {
      ...updateSeccionDto,
    };

    if (updateSeccionDto.nombre && updateSeccionDto.nombre !== Seccion.nombre) {
      const newSlug = this.generateSlug(updateSeccionDto.nombre);
  
      // Verificar si el nuevo slug ya existe
      const existingSeccion = await this.SeccionRepository.findOne({
        where: { slug: newSlug },
      });
      if (existingSeccion && existingSeccion._id.toString() !== id) {
        throw new ConflictException(
          `Ya existe una sección con el slug "${newSlug}"`,
        );
      }
  
      internalUpdateData.slug = newSlug; // Asignar el nuevo slug
    }

    await this.crudHelper.update(Seccion, internalUpdateData);
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

  async addAlumnoToSeccionesByGradoId(
    gradoId: string,
    alumnoId: string,
  ): Promise<void> {
    const secciones = await this.findAllByGradoId(gradoId);
    for (const seccion of secciones) {
      if (!seccion.alumnos.includes(alumnoId)) {
        seccion.alumnos.push(alumnoId);
        await this.SeccionRepository.save(seccion);
      }
    }
  }
}
