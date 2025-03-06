import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateAsistenciaDto } from '../dto/create-asistencia.dto';
import { ObjectId } from 'mongodb';
import { UpdateAsistenciaDto } from '../dto/update-asistencia.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Asistencia } from '../entities/asistencia.entity';
import { Repository, FindManyOptions } from 'typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { User } from 'src/users/entities/user.entity';
import { Alumno } from 'src/alumno/entities/alumno.entity';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { AsistenciaAddAlumnoDto } from '../dto/add-alumno.dto';
import { AsistenciaAddEncargadoDto } from '../dto/add-encargado.dto';

@Injectable()
export class AsistenciaService {
  private readonly crudHelper: CrudHelper<Asistencia>;
  private readonly userCrudHelper: CrudHelper<User>;
  private readonly seccionCrudHelper: CrudHelper<Seccion>;

  constructor(
    @InjectRepository(Asistencia)
    private readonly AsistenciaRepository: Repository<Asistencia>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {
    this.crudHelper = new CrudHelper<Asistencia>(
      this.AsistenciaRepository,
      'Asistencias',
    );
    this.userCrudHelper = new CrudHelper<User>(this.userRepository, 'Users');
    this.seccionCrudHelper = new CrudHelper<Seccion>(
      this.seccionRepository,
      'Secciones',
    );
  }

  async create(
    createAsistenciaDto: CreateAsistenciaDto,
  ): Promise<GeneralResponseDto<Asistencia>> {
    // Verificar si ya existe una asistencia para la sección
    const existingAsistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId: createAsistenciaDto.seccionId },
    });

    if (existingAsistencia) {
      throw new ConflictException('Ya existe una asistencia para esta sección');
    }

    // Validar y transformar alumnos
    const alumnosWithDates =
      createAsistenciaDto.alumnos?.map((alumno) => {
        const fecha = new Date(alumno.fecha);
        if (isNaN(fecha.getTime())) {
          throw new BadRequestException(
            `Fecha inválida para el alumno con fecha: ${alumno.fecha}`,
          );
        }

        return {
          ...alumno,
          fecha: fecha,
        };
      }) || [];

    // Validar y transformar encargados
    const encargadosWithDates =
      createAsistenciaDto.encargados?.map((encargado) => {
        const validarFecha = (valor: string, campo: string) => {
          const fecha = new Date(valor);
          if (isNaN(fecha.getTime())) {
            throw new BadRequestException(
              `${campo} inválido para el encargado en: ${valor}`,
            );
          }
          return fecha;
        };

        return {
          ...encargado,
          fecha: validarFecha(encargado.fecha, 'Fecha'),
          hora_inicio: validarFecha(encargado.hora_inicio, 'Hora de inicio'),
          hora_fin: validarFecha(encargado.hora_fin, 'Hora de fin'),
        };
      }) || [];

    // Validar consistencia de fechas en encargados
    encargadosWithDates.forEach((encargado) => {
      if (encargado.hora_inicio >= encargado.hora_fin) {
        throw new BadRequestException(
          `La hora de inicio debe ser anterior a la hora de fin para el encargado con fecha: ${encargado.fecha}`,
        );
      }
    });

    const newAsistencia = this.AsistenciaRepository.create({
      ...createAsistenciaDto,
      alumnos: alumnosWithDates,
      encargados: encargadosWithDates,
    });

    await this.crudHelper.create(newAsistencia);

    return new GeneralResponseBuilder<Asistencia>()
      .setStatusCode(201)
      .setMessage('Asistencia creada exitosamente')
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

    let results: Asistencia[];
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
        await this.AsistenciaRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.AsistenciaRepository.find({
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

    // Poblar datos de alumnos y encargados
    const populatedResults = await Promise.all(
      results.map(async (asistencia) => {
        // Poblar alumnos
        const alumnosPopulated = await Promise.all(
          (asistencia.alumnos || []).map(async (alumno) => {
            const alumnoData = await this.alumnoRepository.findOneBy({
              _id: new ObjectId(alumno.alumnoId),
            });
            return {
              ...alumno,
              nombre: alumnoData?.nombre || null,
              imagen: alumnoData?.image || null,
            };
          }),
        );

        // Poblar encargados
        const encargadosPopulated = await Promise.all(
          (asistencia.encargados || []).map(async (encargado) => {
            const userData = await this.userRepository.findOneBy({
              _id: new ObjectId(encargado.userId),
            });
            return {
              ...encargado,
              nombre: userData?.nombre || null,
              imagen: userData?.image || null,
            };
          }),
        );

        return {
          ...asistencia,
          alumnos: alumnosPopulated,
          encargados: encargadosPopulated,
        };
      }),
    );

    return new PaginationResponseBuilder()
      .setMessage(
        `Asistencias retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(populatedResults) // Usar los resultados poblados
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<any>> {
    const findAsistencia = await this.crudHelper.findByNameOrId(id);
    if (!findAsistencia) {
      throw new BadRequestException(`Asistencia with id ${id} not found`);
    }

    // Poblar alumnos
    const alumnosPopulated = await Promise.all(
      (findAsistencia.alumnos || []).map(async (alumno) => {
        const alumnoData = await this.alumnoRepository.findOneBy({
          _id: new ObjectId(alumno.alumnoId),
        });
        return {
          ...alumno,
          nombre: alumnoData?.nombre || null,
          imagen: alumnoData?.image || null,
        };
      }),
    );

    // Poblar encargados
    const encargadosPopulated = await Promise.all(
      (findAsistencia.encargados || []).map(async (encargado) => {
        const userData = await this.userRepository.findOneBy({
          _id: new ObjectId(encargado.userId),
        });
        return {
          ...encargado,
          nombre: userData?.nombre || null,
          imagen: userData?.image || null,
        };
      }),
    );

    const populatedAsistencia = {
      ...findAsistencia,
      alumnos: alumnosPopulated,
      encargados: encargadosPopulated,
    };

    return new GeneralResponseBuilder<any>()
      .setMessage('Asistencia retrieved successfully')
      .setData(populatedAsistencia)
      .build();
  }

  async findAsistenciaBySeccionId(
    seccionId: string,
  ): Promise<GeneralResponseDto<any>> {
    const findAsistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!findAsistencia) {
      throw new BadRequestException(
        `Asistencia for seccion ${seccionId} not found`,
      );
    }

    // Poblar alumnos
    const alumnosPopulated = await Promise.all(
      (findAsistencia.alumnos || []).map(async (alumno) => {
        const alumnoData = await this.alumnoRepository.findOneBy({
          _id: new ObjectId(alumno.alumnoId),
        });
        return {
          ...alumno,
          nombre: alumnoData?.nombre || null,
          imagen: alumnoData?.image || null,
        };
      }),
    );

    // Poblar encargados
    const encargadosPopulated = await Promise.all(
      (findAsistencia.encargados || []).map(async (encargado) => {
        const userData = await this.userRepository.findOneBy({
          _id: new ObjectId(encargado.userId),
        });
        return {
          ...encargado,
          nombre: userData?.nombre || null,
          imagen: userData?.image || null,
        };
      }),
    );

    const populatedAsistencia = {
      ...findAsistencia,
      alumnos: alumnosPopulated,
      encargados: encargadosPopulated,
    };

    return new GeneralResponseBuilder<any>()
      .setMessage('Asistencia retrieved successfully')
      .setData(populatedAsistencia)
      .build();
  }

  async findAlumnosBySeccionId(
    seccionId: string,
  ): Promise<GeneralResponseDto<any>> {
    const findAsistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!findAsistencia) {
      throw new BadRequestException(
        `Asistencia for seccion ${seccionId} not found`,
      );
    }

    // Poblar alumnos
    const alumnosPopulated = await Promise.all(
      (findAsistencia.alumnos || []).map(async (alumno) => {
        const alumnoData = await this.alumnoRepository.findOneBy({
          _id: new ObjectId(alumno.alumnoId),
        });
        return {
          ...alumno,
          nombre: alumnoData?.nombre || null,
          imagen: alumnoData?.image || null,
        };
      }),
    );

    return new GeneralResponseBuilder<any>()
      .setMessage('Alumnos retrieved successfully')
      .setData(alumnosPopulated)
      .build();
  }

  async findEncargadosBySeccionId(
    seccionId: string,
  ): Promise<GeneralResponseDto<any>> {
    const findAsistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!findAsistencia) {
      throw new BadRequestException(
        `Asistencia for seccion ${seccionId} not found`,
      );
    }

    // Poblar encargados
    const encargadosPopulated = await Promise.all(
      (findAsistencia.encargados || []).map(async (encargado) => {
        const userData = await this.userRepository.findOneBy({
          _id: new ObjectId(encargado.userId),
        });
        return {
          ...encargado,
          nombre: userData?.nombre || null,
          imagen: userData?.image || null,
        };
      }),
    );

    return new GeneralResponseBuilder<any>()
      .setMessage('Encargados retrieved successfully')
      .setData(encargadosPopulated)
      .build();
  }

  async update(
    id: string,
    updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<GeneralResponseDto<Asistencia>> {
    const Asistencia = await this.crudHelper.findByNameOrId(id);

    // Actualizar los datos del Asistencia
    await this.crudHelper.update(Asistencia, updateAsistenciaDto);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage('Asistencia actualizado exitosamente')
      .build();
  }

  // Helper para validar fechas
  validateDateString = (
    dateString: string,
    fieldName: string,
    entity: string,
  ): Date => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `${fieldName} inválido/a para ${entity}: ${dateString}`,
      );
    }
    return date;
  };

  async addAlumnoToAsistenciaBySeccionId(
    seccionId: string,
    addAlumnoDto: AsistenciaAddAlumnoDto,
  ): Promise<GeneralResponseDto<Asistencia>> {
    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new BadRequestException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }

    // Validación de fecha
    const fecha = this.validateDateString(
      addAlumnoDto.fecha,
      'Fecha del alumno',
      'alumno',
    );

    // Verificar duplicados
    const existeAlumno = asistencia.alumnos.some(
      (a) =>
        a.alumnoId === addAlumnoDto.alumnoId &&
        a.fecha.getTime() === fecha.getTime(),
    );

    if (existeAlumno) {
      throw new ConflictException('El alumno ya tiene registrada esta fecha');
    }

    const newAlumno = {
      ...addAlumnoDto,
      fecha: fecha,
    };

    asistencia.alumnos.push(newAlumno);
    await this.crudHelper.update(asistencia, asistencia);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage('Alumno agregado exitosamente')
      .build();
  }

  async addEncargadoToAsistenciaBySeccionId(
    seccionId: string,
    addEncargadoDto: AsistenciaAddEncargadoDto,
  ): Promise<GeneralResponseDto<Asistencia>> {
    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new BadRequestException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }

    // Validaciones de fechas
    const fecha = this.validateDateString(
      addEncargadoDto.fecha,
      'Fecha del encargado',
      'encargado',
    );
    const horaInicio = this.validateDateString(
      addEncargadoDto.hora_inicio,
      'Hora de inicio',
      'encargado,',
    );
    const horaFin = this.validateDateString(
      addEncargadoDto.hora_fin,
      'Hora de fin',
      'encargado',
    );

    // Validación de consistencia horaria
    if (horaInicio >= horaFin) {
      throw new BadRequestException(
        `La hora de inicio debe ser anterior a la hora de fin para el encargado ${addEncargadoDto.userId}`,
      );
    }

    // Validar solapamiento de horarios
    const existeSolapamiento = asistencia.encargados.some(
      (e) =>
        e.userId === addEncargadoDto.userId &&
        ((horaInicio >= e.hora_inicio && horaInicio < e.hora_fin) ||
          (horaFin > e.hora_inicio && horaFin <= e.hora_fin)),
    );

    if (existeSolapamiento) {
      throw new ConflictException('El encargado tiene horarios solapados');
    }

    const newEncargado = {
      ...addEncargadoDto,
      fecha: fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
    };

    asistencia.encargados.push(newEncargado);
    await this.crudHelper.update(asistencia, asistencia);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage('Encargado agregado exitosamente')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Asistencia>> {
    const Asistencia = await this.crudHelper.findByNameOrId(id);

    await this.crudHelper.delete(Asistencia, true);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage('Asistencia deleted successfully')
      .build();
  }

  async removeBySeccionId(seccionId: string): Promise<GeneralResponseDto<any>> {
    const Asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!Asistencia) {
      throw new BadRequestException(
        `Asistencia for seccion ${seccionId} not found`,
      );
    }

    await this.crudHelper.delete(Asistencia, true);

    return new GeneralResponseBuilder<any>()
      .setMessage('Asistencia deleted successfully')
      .build();
  }
}
