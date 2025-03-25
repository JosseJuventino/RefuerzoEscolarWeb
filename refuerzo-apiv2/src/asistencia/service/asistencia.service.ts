import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
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
import { ArrayAsistenciaAddAlumnoDto } from '../dto/add-alumno.dto';
import { AsistenciaAddEncargadoDto } from '../dto/add-encargado.dto';
import {
  UpdateAlumnoRegistroDto,
  UpdateEncargadoRegistroDto,
} from '../dto/update-register.dto';

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

  async findAlumnosBySeccionAndDate(
    seccionId: string,
    fecha: string,
  ): Promise<GeneralResponseDto<any>> {
    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new NotFoundException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }

    // Validar y formatear fecha
    const fechaBusqueda = new Date(fecha);
    if (isNaN(fechaBusqueda.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }

    const alumnosFiltrados = (asistencia.alumnos || []).filter((a) => {
      if (!a.fecha) return false; // Verificar si existe
      const fechaAlumno = new Date(a.fecha); // Convertir a Date
      return (
        fechaAlumno.toISOString().split('T')[0] ===
        fechaBusqueda.toISOString().split('T')[0]
      );
    });

    // Poblar datos de alumnos
    const alumnosPopulated = await Promise.all(
      alumnosFiltrados.map(async (alumno) => {
        const alumnoData = await this.alumnoRepository.findOneBy({
          _id: new ObjectId(alumno.alumnoId),
        });
        return {
          ...alumno,
          nombre: alumnoData?.nombre,
          imagen: alumnoData?.image,
        };
      }),
    );

    return new GeneralResponseBuilder<any>()
      .setData(alumnosPopulated)
      .setMessage('Registros de alumnos encontrados')
      .build();
  }

  async findEncargadosBySeccionAndDate(
    seccionId: string,
    fecha: string,
  ): Promise<GeneralResponseDto<any>> {
    // En el servicio, antes de buscar la asistencia:
    if (!ObjectId.isValid(seccionId)) {
      throw new BadRequestException(`ID de sección inválido: ${seccionId}`);
    }

    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new NotFoundException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }

    // Validar y formatear fecha
    const fechaBusqueda = new Date(fecha);

    if (isNaN(fechaBusqueda.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }

    const encargadosFiltrados = (asistencia.encargados || []).filter((e) => {
      if (!e.fecha) return false; // Verificar si existe
      const fechaEncargado = new Date(e.fecha); // Convertir a Date
      return (
        fechaEncargado.toISOString().split('T')[0] ===
        fechaBusqueda.toISOString().split('T')[0]
      );
    });

    // Poblar datos de usuarios
    const encargadosPopulated = await Promise.all(
      encargadosFiltrados.map(async (encargado) => {
        const userData = await this.userRepository.findOneBy({
          _id: new ObjectId(encargado.userId),
        });
        return {
          ...encargado,
          nombre: userData?.nombre,
          imagen: userData?.image,
        };
      }),
    );

    return new GeneralResponseBuilder<any>()
      .setData(encargadosPopulated)
      .setMessage('Registros de encargados encontrados')
      .build();
  }

  async getEncargadosGroupedByDate(
    seccionId: string,
    month: number,
    year: number,
  ): Promise<GeneralResponseDto<any>> {
    this.validateMonthYear(month, year);

    const asistencia = await this.getValidAsistencia(seccionId);
    const { startDate, endDate } = this.createMonthRange(month, year);

    const encargadosFiltrados = this.filterByDateRange(
      asistencia.encargados,
      startDate,
      endDate,
    );

    const grouped = this.groupByDate(encargadosFiltrados);
    const populatedGrouped = await this.populateEncargados(grouped);

    return this.buildSuccessResponse(
      populatedGrouped,
      'Encargados agrupados por fecha obtenidos exitosamente',
    );
  }

  async getAlumnosGroupedByDate(
    seccionId: string,
    month: number,
    year: number,
  ): Promise<GeneralResponseDto<any>> {
    this.validateMonthYear(month, year);

    const asistencia = await this.getValidAsistencia(seccionId);
    const { startDate, endDate } = this.createMonthRange(month, year);

    const alumnosFiltrados = this.filterByDateRange(
      asistencia.alumnos,
      startDate,
      endDate,
    );

    const grouped = this.groupByDate(alumnosFiltrados);
    const populatedGrouped = await this.populateAlumnos(grouped);

    return this.buildSuccessResponse(
      populatedGrouped,
      'Alumnos agrupados por fecha obtenidos exitosamente',
    );
  }

  private validateMonthYear(month: number, year: number): void {
    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      throw new BadRequestException('Año inválido');
    }
  }

  private async getValidAsistencia(seccionId: string): Promise<Asistencia> {
    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new NotFoundException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }
    return asistencia;
  }

  private createMonthRange(month: number, year: number) {
    return {
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 1),
    };
  }

  private filterByDateRange(registros: any[], startDate: Date, endDate: Date) {
    return (registros || []).filter((registro) => {
      try {
        const fecha = new Date(registro.fecha);
        if (isNaN(fecha.getTime())) {
          console.warn(`Fecha inválida en registro: ${registro.fecha}`);
          return false; // Descarta registros con fechas inválidas
        }
        return fecha >= startDate && fecha < endDate;
      } catch (error) {
        return false;
      }
    });
  }

  private groupByDate(registros: any[]): { [key: string]: any[] } {
    return registros.reduce((acc, registro) => {
      try {
        // Convertir a Date si es necesario
        const fecha = new Date(registro.fecha);

        if (isNaN(fecha.getTime())) {
          console.error(`Fecha inválida: ${registro.fecha}`);
          return acc; // Saltar registro inválido
        }

        const dateKey = fecha.toISOString().split('T')[0];
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(registro);
        return acc;
      } catch (error) {
        console.error(`Error procesando fecha: ${registro.fecha}`, error);
        return acc;
      }
    }, {});
  }

  private async populateEncargados(grouped: {
    [key: string]: any[];
  }): Promise<any> {
    const populated: any = {};
    for (const [date, encargados] of Object.entries(grouped)) {
      populated[date] = await Promise.all(
        encargados.map(async (e) => {
          const user = await this.userRepository.findOneBy({
            _id: new ObjectId(e.userId),
          });
          return {
            ...e,
            nombre: user?.nombre || 'No encontrado',
            imagen: user?.image || null,
          };
        }),
      );
    }
    return populated;
  }

  private async populateAlumnos(grouped: {
    [key: string]: any[];
  }): Promise<any> {
    const populated: any = {};
    for (const [date, alumnos] of Object.entries(grouped)) {
      populated[date] = await Promise.all(
        alumnos.map(async (a) => {
          const alumno = await this.alumnoRepository.findOneBy({
            _id: new ObjectId(a.alumnoId),
          });
          return {
            ...a,
            nombre: alumno?.nombre || 'No encontrado',
            imagen: alumno?.image || null,
          };
        }),
      );
    }
    return populated;
  }

  private buildSuccessResponse(data: any, message: string) {
    return new GeneralResponseBuilder<any>()
      .setData(data)
      .setMessage(message)
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

  async addAlumnosToAsistenciaBySeccionId(
    seccionId: string,
    addAlumnosDto: ArrayAsistenciaAddAlumnoDto,
  ): Promise<GeneralResponseDto<Asistencia>> {
    const asistencia = await this.AsistenciaRepository.findOne({
      where: { seccionId },
    });

    if (!asistencia) {
      throw new BadRequestException(
        `Asistencia para sección ${seccionId} no encontrada`,
      );
    }

    const asistenciasToAdd = addAlumnosDto.asistencias;
    const processedAlumnos = [];
    const seenKeys = new Set<string>();

    for (const alumnoDto of asistenciasToAdd) {
      const fecha = this.validateDateString(
        alumnoDto.fecha,
        'Fecha del alumno',
        'alumno',
      );

      const key = `${alumnoDto.alumnoId}-${fecha.getTime()}`;

      if (seenKeys.has(key)) {
        throw new ConflictException(
          'Hay alumnos duplicados en la solicitud para la misma fecha',
        );
      }
      seenKeys.add(key);

      // Buscar registro existente por alumnoId y fecha (sin hora)
      const existingIndex = asistencia.alumnos.findIndex(
        (a) =>
          a.alumnoId === alumnoDto.alumnoId &&
          a.fecha.toISOString().substring(0, 10) ===
            fecha.toISOString().substring(0, 10),
      );

      if (existingIndex !== -1) {
        // Actualizar fecha y estado del registro existente
        asistencia.alumnos[existingIndex].fecha = fecha;
        asistencia.alumnos[existingIndex].estado = alumnoDto.estado;
      } else {
        // Agregar a procesados para crear nuevo registro
        processedAlumnos.push({
          ...alumnoDto,
          fecha: fecha,
        });
      }
    }

    // Crear nuevos registros solo para alumnos no existentes
    const newAlumnos = processedAlumnos.map((alumno) => ({
      id: new ObjectId().toHexString(),
      ...alumno,
    }));

    asistencia.alumnos.push(...newAlumnos);
    await this.crudHelper.update(asistencia, asistencia);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage('Alumnos agregados o actualizados exitosamente')
      .build();
  }

  async addEncargadoToAsistenciaBySeccionId(
    seccionId: string,
    encargadoDto: AsistenciaAddEncargadoDto,
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
      encargadoDto.fecha,
      'Fecha del encargado',
      'encargado',
    );
    const horaInicio = this.validateDateString(
      encargadoDto.hora_inicio,
      'Hora de inicio',
      'encargado',
    );
    const horaFin = this.validateDateString(
      encargadoDto.hora_fin,
      'Hora de fin',
      'encargado',
    );

    // Validación de consistencia horaria
    if (horaInicio >= horaFin) {
      throw new BadRequestException(
        `La hora de inicio debe ser anterior a la hora de fin para el encargado ${encargadoDto.userId}`,
      );
    }

    // Buscar registro existente por userId y fecha (solo día)
    const existingIndex = asistencia.encargados.findIndex((e) => {
      const existingFecha = new Date(e.fecha);
      return (
        e.userId === encargadoDto.userId &&
        existingFecha.toISOString().substring(0, 10) ===
          fecha.toISOString().substring(0, 10)
      );
    });

    // Función para verificar solapamientos
    const checkSolapamiento = (entries: any[]): boolean => {
      return entries.some((e) => {
        const existingHoraInicio = new Date(e.hora_inicio);
        const existingHoraFin = new Date(e.hora_fin);

        return (
          e.userId === encargadoDto.userId &&
          ((horaInicio >= existingHoraInicio && horaInicio < existingHoraFin) ||
            (horaFin > existingHoraInicio && horaFin <= existingHoraFin) ||
            (horaInicio <= existingHoraInicio && horaFin >= existingHoraFin))
        );
      });
    };

    let existeSolapamiento = false;

    if (existingIndex !== -1) {
      // Verificar solapamiento excluyendo el registro actual
      const otrosEncargados = asistencia.encargados.filter(
        (_, index) => index !== existingIndex,
      );
      existeSolapamiento = checkSolapamiento(otrosEncargados);
    } else {
      // Verificar solapamiento con todos los registros
      existeSolapamiento = checkSolapamiento(asistencia.encargados);
    }

    if (existeSolapamiento) {
      throw new ConflictException(
        `El encargado ${encargadoDto.userId} tiene horarios solapados con registros existentes`,
      );
    }

    if (existingIndex !== -1) {
      // Actualizar registro existente
      asistencia.encargados[existingIndex] = {
        ...asistencia.encargados[existingIndex],
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: encargadoDto.estado,
      };
    } else {
      // Crear nuevo registro
      const newEncargado = {
        id: new ObjectId().toHexString(),
        ...encargadoDto,
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      };
      asistencia.encargados.push(newEncargado);
    }

    await this.crudHelper.update(asistencia, asistencia);

    return new GeneralResponseBuilder<Asistencia>()
      .setMessage(
        existingIndex !== -1
          ? 'Registro de encargado actualizado exitosamente'
          : 'Encargado agregado exitosamente',
      )
      .build();
  }

  async findAlumnoById(id: string): Promise<GeneralResponseDto<any>> {
    const asistencias = await this.AsistenciaRepository.find();

    let alumnoEncontrado: any = null;

    for (const asistencia of asistencias) {
      const alumno = asistencia.alumnos.find((a) => a.id === id);
      if (alumno) {
        alumnoEncontrado = alumno;
        break;
      }
    }

    if (!alumnoEncontrado) {
      throw new NotFoundException(
        `Registro de alumno con ID ${id} no encontrado`,
      );
    }

    const alumnoData = await this.alumnoRepository.findOneBy({
      _id: new ObjectId(alumnoEncontrado.alumnoId),
    });

    return new GeneralResponseBuilder<any>()
      .setData({
        ...alumnoEncontrado,
        nombre: alumnoData?.nombre,
        imagen: alumnoData?.image,
      })
      .setMessage('Registro de alumno encontrado')
      .build();
  }

  async findEncargadoById(id: string): Promise<GeneralResponseDto<any>> {
    const asistencias = await this.AsistenciaRepository.find();

    let encargadoEncontrado: any = null;

    for (const asistencia of asistencias) {
      const encargado = asistencia.encargados.find((e) => e.id === id);
      if (encargado) {
        encargadoEncontrado = encargado;
        break;
      }
    }

    if (!encargadoEncontrado) {
      throw new NotFoundException(
        `Registro de encargado con ID ${id} no encontrado`,
      );
    }

    const userData = await this.userRepository.findOneBy({
      _id: new ObjectId(encargadoEncontrado.userId),
    });

    return new GeneralResponseBuilder<any>()
      .setData({
        ...encargadoEncontrado,
        nombre: userData?.nombre,
        imagen: userData?.image,
      })
      .setMessage('Registro de encargado encontrado')
      .build();
  }

  async updateAlumnoRegister(
    id: string,
    updateDto: UpdateAlumnoRegistroDto,
  ): Promise<GeneralResponseDto<any>> {
    const asistencias = await this.AsistenciaRepository.find();

    let registroIndex = -1;
    let asistenciaPadre: Asistencia | null = null;

    // Buscar el registro en todas las asistencias
    for (const asistencia of asistencias) {
      registroIndex = asistencia.alumnos.findIndex((a) => a.id === id);
      if (registroIndex !== -1) {
        asistenciaPadre = asistencia;
        break;
      }
    }

    if (!asistenciaPadre || registroIndex === -1) {
      throw new NotFoundException(
        `Registro de alumno con ID ${id} no encontrado`,
      );
    }

    // Validar y actualizar campos
    const updatedRegistro = {
      ...asistenciaPadre.alumnos[registroIndex],
      ...updateDto,
      fecha: updateDto.fecha
        ? new Date(updateDto.fecha)
        : asistenciaPadre.alumnos[registroIndex].fecha,
    };

    // Validación de fecha
    if (isNaN(updatedRegistro.fecha.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }

    // Actualizar el registro
    asistenciaPadre.alumnos[registroIndex] = updatedRegistro;
    await this.crudHelper.update(asistenciaPadre, asistenciaPadre);

    // Obtener datos actualizados
    const alumnoData = await this.alumnoRepository.findOneBy({
      _id: new ObjectId(updatedRegistro.alumnoId),
    });

    return new GeneralResponseBuilder<any>()
      .setMessage('Registro de alumno actualizado exitosamente')
      .build();
  }

  async updateEncargadoRegister(
    id: string,
    updateDto: UpdateEncargadoRegistroDto,
  ): Promise<GeneralResponseDto<any>> {
    const asistencias = await this.AsistenciaRepository.find();

    let registroIndex = -1;
    let asistenciaPadre: Asistencia | null = null;

    // Buscar el registro en todas las asistencias
    for (const asistencia of asistencias) {
      registroIndex = asistencia.encargados.findIndex((e) => e.id === id);
      if (registroIndex !== -1) {
        asistenciaPadre = asistencia;
        break;
      }
    }

    if (!asistenciaPadre || registroIndex === -1) {
      throw new NotFoundException(
        `Registro de encargado con ID ${id} no encontrado`,
      );
    }

    // Validar y actualizar campos
    const updatedRegistro = {
      ...asistenciaPadre.encargados[registroIndex],
      ...updateDto,
      fecha: updateDto.fecha
        ? new Date(updateDto.fecha)
        : asistenciaPadre.encargados[registroIndex].fecha,
      hora_inicio: updateDto.hora_inicio
        ? new Date(updateDto.hora_inicio)
        : asistenciaPadre.encargados[registroIndex].hora_inicio,
      hora_fin: updateDto.hora_fin
        ? new Date(updateDto.hora_fin)
        : asistenciaPadre.encargados[registroIndex].hora_fin,
    };

    // Validaciones
    if (updatedRegistro.hora_inicio >= updatedRegistro.hora_fin) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }

    // Actualizar el registro
    asistenciaPadre.encargados[registroIndex] = updatedRegistro;
    await this.crudHelper.update(asistenciaPadre, asistenciaPadre);

    // Obtener datos actualizados
    const userData = await this.userRepository.findOneBy({
      _id: new ObjectId(updatedRegistro.userId),
    });

    return new GeneralResponseBuilder<any>()
      .setMessage('Registro de encargado actualizado exitosamente')
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
