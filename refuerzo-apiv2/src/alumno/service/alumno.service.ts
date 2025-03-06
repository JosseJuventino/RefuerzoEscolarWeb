import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
import { ObjectId } from 'mongodb';
import { UpdateAlumnoDto } from '../dto/update-alumno.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Alumno } from '../entities/alumno.entity';
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
import { User } from 'src/users/entities/user.entity';
import { Grado } from 'src/grado/entities/grado.entity';
import { UsersService } from 'src/users/users.service';
import { PostulanteService } from 'src/postulante/service/postulante.service';
import { SeccionService } from 'src/seccion/service/seccion.service';
import { UpdateAlumnoByUserDto } from '../dto/update-alumnoByUser.dto';
import { Seccion } from 'src/seccion/entities/seccion.entity';

@Injectable()
export class AlumnoService {
  private readonly crudHelper: CrudHelper<Alumno>;
  private readonly userCrudHelper: CrudHelper<User>;
  private readonly seccionCrudHelper: CrudHelper<Seccion>;

  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Grado)
    private readonly gradoRepository: Repository<Grado>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly postulanteService: PostulanteService,
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
    @Inject(forwardRef(() => SeccionService))
    private readonly seccionService: SeccionService,
  ) {
    this.crudHelper = new CrudHelper<Alumno>(this.alumnoRepository, 'Alumnos');
    this.userCrudHelper = new CrudHelper<User>(this.userRepository, 'Users');
    this.seccionCrudHelper = new CrudHelper<Seccion>(
      this.seccionRepository,
      'Secciones',
    );
  }

  async create(
    createAlumnoDto: CreateAlumnoDto,
  ): Promise<GeneralResponseDto<Alumno>> {
    const findAlumno = await this.crudHelper.findByIdOrUserId(
      createAlumnoDto.userId,
      false,
      false,
    );
    if (findAlumno) {
      throw new ConflictException(
        `Alumno with id ${createAlumnoDto.userId} already exists`,
      );
    }

    const newAlumno = this.alumnoRepository.create({
      userId: createAlumnoDto.userId,
      gradoId: createAlumnoDto.gradoId,
      nombre: createAlumnoDto.nombre,
      email: createAlumnoDto.email,
      image: createAlumnoDto.image,
      telefonoEncargado: createAlumnoDto.telefonoEncargado,
    });

    await this.crudHelper.create(newAlumno);

    // Agregar alumno a las secciones con el mismo gradoId
    await this.seccionService.addAlumnoToSeccionesByGradoId(
      newAlumno.gradoId,
      newAlumno._id.toString(),
    );

    return new GeneralResponseBuilder<Alumno>()
      .setStatusCode(201)
      .setMessage('Alumno creado exitosamente')
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

    let results: Alumno[];
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
      [results, total] = await this.alumnoRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.alumnoRepository.find({
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

    // Obtener todos los userIds y gradoIds de los resultados
    const userIds = results.map((a) => new ObjectId(a.userId));
    const gradoIds = results.map((a) => new ObjectId(a.gradoId));

    // Buscar usuarios y grados en lote
    const users = await this.userRepository.find({
      where: { _id: { $in: userIds } } as any,
      select: ['_id', 'email', 'telefono'],
    });

    const grados = await this.gradoRepository.find({
      where: { _id: { $in: gradoIds } } as any,
      select: ['_id', 'nombre'],
    });

    // Crear mapas para búsqueda rápida
    const userMap = new Map<string, any>();
    users.forEach((user) => {
      const userId = user._id.toString();
      userMap.set(userId, {
        email: user.email,
        telefono: user.telefono,
      });
    });

    const gradoMap = new Map<string, string>();
    grados.forEach((grado) => {
      const gradoId = grado._id.toString();
      gradoMap.set(gradoId, grado.nombre);
    });

    // Transformar los resultados para incluir datos poblados
    const populatedResults = results.map((alumno) => {
      const { userId, gradoId, ...rest } = alumno;
      return {
        ...rest,
        user: userMap.get(userId) || null,
        grado: gradoMap.get(gradoId) || null,
      };
    });

    // Construir respuesta con datos poblados
    return new PaginationResponseBuilder()
      .setMessage(`Alumnos retrieved successfully. Total pages: ${totalPages}`)
      .setData(populatedResults)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<any>> {
    const findAlumno = await this.crudHelper.findByNameOrId(id);
    if (!findAlumno) {
      throw new BadRequestException(`Alumno with id ${id} not found`);
    }

    // Obtener usuario relacionado
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(findAlumno.userId) },
      select: ['email', 'telefono'],
    });

    if (!user) {
      throw new BadRequestException(
        `User not found for id ${findAlumno.userId}`,
      );
    }

    // Obtener grado relacionado
    const grado = await this.gradoRepository.findOne({
      where: { _id: new ObjectId(findAlumno.gradoId) },
      select: ['nombre'],
    });

    if (!grado) {
      throw new BadRequestException(
        `Grado not found for id ${findAlumno.gradoId}`,
      );
    }

    // Crear objeto con datos poblados
    const { userId, gradoId, ...rest } = findAlumno;
    const populatedAlumno = {
      ...rest,
      user: {
        email: user.email,
        telefono: user.telefono,
      },
      grado: grado.nombre,
    };

    return new GeneralResponseBuilder<any>()
      .setMessage('Alumno retrieved successfully')
      .setData(populatedAlumno)
      .build();
  }

  async update(
    id: string,
    updateAlumnoDto: UpdateAlumnoDto,
  ): Promise<GeneralResponseDto<Alumno>> {
    const alumno = await this.crudHelper.findByNameOrId(id);

    // Verificar si se está actualizando el gradoId
    if (updateAlumnoDto.gradoId && updateAlumnoDto.gradoId !== alumno.gradoId) {
      const newGradoId = updateAlumnoDto.gradoId;

      // Validar que el nuevo grado existe
      const newGrado = await this.gradoRepository.findOne({
        where: { _id: new ObjectId(newGradoId) },
      });
      if (!newGrado) {
        throw new BadRequestException(
          `Grado con id ${newGradoId} no encontrado`,
        );
      }

      const oldGradoId = alumno.gradoId;
      const alumnoId = alumno._id.toString();

      // Eliminar de secciones del antiguo grado
      await this.seccionService.deleteAlumnoFromSeccionesByGradoId(
        oldGradoId,
        alumnoId,
      );

      // Agregar a secciones del nuevo grado
      await this.seccionService.addAlumnoToSeccionesByGradoId(
        newGradoId,
        alumnoId,
      );
    }

    // Actualizar los datos del alumno
    await this.crudHelper.update(alumno, updateAlumnoDto);

    return new GeneralResponseBuilder<Alumno>()
      .setMessage('Alumno actualizado exitosamente')
      .build();
  }

  async updateByUserId(
    userId: string,
    updateAlumnoByUserDto: UpdateAlumnoByUserDto,
  ): Promise<GeneralResponseDto<Alumno>> {
    const Alumno = await this.crudHelper.findByIdOrUserId(userId, false, false);

    await this.crudHelper.update(Alumno, updateAlumnoByUserDto);
    return new GeneralResponseBuilder<Alumno>()
      .setMessage('Alumno updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Alumno>> {
    const Alumno = await this.crudHelper.findByNameOrId(id);

    const user = await this.userCrudHelper.findByNameOrId(Alumno.userId);

    // Cambiar el isUser de Postulante a false
    await this.postulanteService.updateIsUser(user.idDependingRole, false);

    // Eliminar el usuario
    await this.usersService.remove(Alumno.userId);

    await this.seccionService.deleteAlumnoFromSeccionesByGradoId(
      Alumno.gradoId,
      Alumno._id.toString(),
    );

    await this.crudHelper.delete(Alumno, true);

    return new GeneralResponseBuilder<Alumno>()
      .setMessage('Alumno deleted successfully')
      .build();
  }
}
