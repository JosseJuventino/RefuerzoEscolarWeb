import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CrudHelper } from '../common/helper/crud.helper';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, MoreThan, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { EmailService } from 'src/email/service/email.service';
import { Role } from 'src/roles/entities/role.entity';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token';
import * as crypto from 'crypto';

import { recomendadorAccountCreatedTemplate } from 'src/email/templates/createRecomendatorTemplate';
import { CreateNewAlumnoDto } from './dto/create-alumno.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { Postulante } from 'src/postulante/entities/postulante.entity';
import { alumnoAccountCreatedTemplate } from 'src/email/templates/createAlumnoTemplate';
import { AlumnoService } from '../alumno/service/alumno.service';
import { CreateAlumnoDto } from 'src/alumno/dto/create-alumno.dto';
import { PostulanteService } from 'src/postulante/service/postulante.service';
import { SeccionService } from 'src/seccion/service/seccion.service';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  private readonly crudHelper: CrudHelper<User>;
  private readonly roleCrudHelper: CrudHelper<Role>;
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Postulante)
    private readonly postulanteRepository: Repository<Postulante>,
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
    @Inject(forwardRef(() => AlumnoService))
    private readonly alumnoService: AlumnoService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PostulanteService))
    private readonly postulanteService: PostulanteService,
    private readonly seccionService: SeccionService,
  ) {
    this.crudHelper = new CrudHelper<User>(this.userRepository, 'Users');
    this.roleCrudHelper = new CrudHelper<Role>(this.roleRepository, 'Roles');
  }
  async create(
    createUserDto: CreateUserDto,
  ): Promise<GeneralResponseDto<User>> {
    const role = await this.roleCrudHelper.findByNameOrId(createUserDto.role);
    if (!role) {
      throw new BadRequestException(`Role ${createUserDto.role} not found`);
    }
    const findUser = await this.crudHelper.findByEmailOrId(
      createUserDto.email,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }
    //Paso para encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    await this.crudHelper.create(newUser);
    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('User created successfully')
      .build();
  }

  async createRecomendador(
    createNewRecomendadorDto: CreateNewRecomendadorDto,
  ): Promise<GeneralResponseDto<User>> {
    const role = await this.roleCrudHelper.findByNameOrId(
      'recomendador',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role recomendador not found`);
    }
    const findUser = await this.crudHelper.findByEmailOrId(
      createNewRecomendadorDto.email,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with email ${createNewRecomendadorDto.email} already exists`,
      );
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // Generar una contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = this.userRepository.create({
      nombre: createNewRecomendadorDto.nombre,
      email: createNewRecomendadorDto.email,
      telefono: createNewRecomendadorDto.telefono,
      image: createNewRecomendadorDto.image,
      isActive: false,
      role: role._id.toString(),
      password: hashedPassword,
    });

    await this.crudHelper.create(newUser);

    const sendEmailDto: SendEmailDto = {
      to: [createNewRecomendadorDto.email],
      replyTo: ['soporte@refuerzo-mendoza.me'],
      subject: 'Cuenta de Recomendador Creada',
      from: 'soporte@refuerzo-mendoza.me',
      text: `Hola ${createNewRecomendadorDto.nombre},\n\nTu contraseña temporal es: ${temporaryPassword}\nPor favor inicia sesión y cambia tu contraseña.`,
      html: recomendadorAccountCreatedTemplate(
        createNewRecomendadorDto.nombre,
        temporaryPassword,
      ),
    };

    try {
      await this.emailService.sendEmail(sendEmailDto);
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('Recomendador created successfully')
      .build();
  }

  async createAlumno(
    createNewAlumnoDto: CreateNewAlumnoDto,
  ): Promise<GeneralResponseDto<User>> {
    const role = await this.roleCrudHelper.findByNameOrId(
      'alumno',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role alumno not found`);
    }
    const findUser = await this.crudHelper.findByEmailOrId(
      createNewAlumnoDto.email,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with email ${createNewAlumnoDto.email} already exists`,
      );
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // Generar una contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = this.userRepository.create({
      nombre: createNewAlumnoDto.nombre,
      email: createNewAlumnoDto.email,
      telefono: createNewAlumnoDto.telefono,
      image: createNewAlumnoDto.image,
      isActive: false,
      role: role._id.toString(),
      password: hashedPassword,
      idDependingRole: createNewAlumnoDto.idDependingRole,
    });

    const savedUser = await this.userRepository.save(newUser);

    const sendEmailDto: SendEmailDto = {
      to: [createNewAlumnoDto.email],
      replyTo: ['soporte@refuerzo-mendoza.me'],
      subject: 'Cuenta de Alumno Creada',
      from: 'soporte@refuerzo-mendoza.me',
      text: `Hola ${createNewAlumnoDto.nombre},\n\nTu contraseña temporal es: ${temporaryPassword}\nPor favor inicia sesión y cambia tu contraseña.`,
      html: alumnoAccountCreatedTemplate(
        createNewAlumnoDto.nombre,
        temporaryPassword,
      ),
    };

    try {
      await this.emailService.sendEmail(sendEmailDto);
    } catch (error) {
      console.error('Error sending email:', error);
    }

    //

    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('Alumno created successfully')
      .build();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const filter: FindManyOptions<User>['where'] = {};

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

    let results: User[];
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
      [results, total] = await this.userRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.userRepository.find({
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

    // Enriquecer los usuarios con roles y permisos
    const users = await Promise.all(
      results.map(async (user) => {
        return {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          image: user.image,
        };
      }),
    );

    // Construir la respuesta paginada
    return new PaginationResponseBuilder()
      .setMessage(`Users retrieved successfully. Total pages: ${totalPages}`)
      .setData(users)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findAllProfesores(): Promise<GeneralResponseDto<any>> {
    const profesorRole = await this.roleCrudHelper.findByNameOrId(
      'profesor',
      false,
      false,
    );
    if (!profesorRole) {
      throw new BadRequestException('Rol "profesor" no encontrado');
    }

    const profesores = await this.userRepository.find({
      where: { role: profesorRole._id.toString() },
      select: ['_id', 'nombre', 'email', 'telefono', 'image'],
    });

    const secciones = await this.seccionRepository.find({
      select: ['encargados', 'nombre'],
    });

    const encargadosSeccionesMap = new Map<string, string[]>();
    for (const seccion of secciones) {
      const nombreSeccion = seccion.nombre;
      for (const encargadoId of seccion.encargados) {
        const idStr = encargadoId.toString();
        if (encargadosSeccionesMap.has(idStr)) {
          encargadosSeccionesMap.get(idStr).push(nombreSeccion);
        } else {
          encargadosSeccionesMap.set(idStr, [nombreSeccion]);
        }
      }
    }

    const profesoresConEstado = profesores.map((profesor) => ({
      ...profesor,
      isEncargado: encargadosSeccionesMap.has(profesor._id.toString()),
      secciones: encargadosSeccionesMap.get(profesor._id.toString()) || [],
    }));

    profesoresConEstado.sort(
      (a, b) => Number(a.isEncargado) - Number(b.isEncargado),
    );

    return new GeneralResponseBuilder()
      .setMessage('Profesores obtenidos exitosamente')
      .setData(profesoresConEstado)
      .build();
  }

  async findAllTutores(): Promise<GeneralResponseDto<any>> {
    const tutorRole = await this.roleCrudHelper.findByNameOrId(
      'tutor',
      false,
      false,
    );
    if (!tutorRole) {
      throw new BadRequestException('Rol "tutor" no encontrado');
    }

    const tutores = await this.userRepository.find({
      where: { role: tutorRole._id.toString() },
      select: ['_id', 'nombre', 'email', 'telefono', 'image'],
    });

    const secciones = await this.seccionRepository.find({
      select: ['encargados', 'nombre'],
    });

    const encargadosSeccionesMap = new Map<string, string[]>();
    for (const seccion of secciones) {
      const nombreSeccion = seccion.nombre;
      for (const encargadoId of seccion.encargados) {
        const idStr = encargadoId.toString();
        if (encargadosSeccionesMap.has(idStr)) {
          encargadosSeccionesMap.get(idStr).push(nombreSeccion);
        } else {
          encargadosSeccionesMap.set(idStr, [nombreSeccion]);
        }
      }
    }

    const tutoresConEstado = tutores.map((tutor) => ({
      ...tutor,
      isEncargado: encargadosSeccionesMap.has(tutor._id.toString()),
      secciones: encargadosSeccionesMap.get(tutor._id.toString()) || [],
    }));

    tutoresConEstado.sort(
      (a, b) => Number(a.isEncargado) - Number(b.isEncargado),
    );

    return new GeneralResponseBuilder()
      .setMessage('Tutores obtenidos exitosamente')
      .setData(tutoresConEstado)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<User>> {
    const findUser = await this.crudHelper.findByNameOrId(id);
    if (!findUser) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    return new GeneralResponseBuilder<User>()
      .setMessage('User retrieved successfully')
      .setData(findUser)
      .build();
  }

  async findAllRecomendadores(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    // Obtener el rol "recomendador"
    const role = await this.roleCrudHelper.findByNameOrId(
      'recomendador',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role 'recomendador' not found`);
    }

    const filter: any = { role: role._id.toString() };

    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i',
      };
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: User[];
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

      [results, total] = await this.userRepository.findAndCount(queryOptions);
      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.userRepository.find({
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

    // 1. Obtener IDs de los recomendadores como strings
    const recomendadorIds = results.map((user) => user._id.toString());

    // 2. Buscar todos los postulantes relacionados (usando strings)
    const postulantes = await this.postulanteRepository.find({
      where: {
        recomendador: { $in: recomendadorIds } as any,
      },
    });

    // 3. Contar postulantes por recomendador
    const postulantesCountMap = postulantes.reduce((map, postulante) => {
      const key = postulante.recomendador; // Ya es string
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>());

    // 4. Mapear resultados con el conteo
    const recomendadores = results.map((user) => ({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      image: user.image,
      isActive: user.isActive,
      postulantesCount: postulantesCountMap.get(user._id.toString()) || 0,
    }));

    return new PaginationResponseBuilder()
      .setMessage(
        `Recomendadores retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(recomendadores)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findAllAlumnos(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    // Obtener el rol "recomendador"
    const role = await this.roleCrudHelper.findByNameOrId(
      'alumno',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role 'recomendador' not found`);
    }

    const filter: any = { role: role._id.toString() };

    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i',
      };
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: User[];
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

      [results, total] = await this.userRepository.findAndCount(queryOptions);
      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.userRepository.find({
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

    const recomendadores = await Promise.all(
      results.map(async (user) => {
        return {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          image: user.image,
          isActive: user.isActive,
        };
      }),
    );

    return new PaginationResponseBuilder()
      .setMessage(`Alumnos retrieved successfully. Total pages: ${totalPages}`)
      .setData(recomendadores)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findAllTutoresWithPagination(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    // Obtener el rol "recomendador"
    const role = await this.roleCrudHelper.findByNameOrId(
      'tutor',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role 'recomendador' not found`);
    }

    const filter: any = { role: role._id.toString() };

    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i',
      };
    }

    // Obtener todas las secciones con encargados y nombres
    const secciones = await this.seccionRepository.find({
      select: ['encargados', 'nombre'],
    });

    // Crear mapa de ID de encargado a nombres de secciones
    const encargadosSeccionesMap = new Map<string, string[]>();
    for (const seccion of secciones) {
      const nombreSeccion = seccion.nombre;
      for (const encargadoId of seccion.encargados) {
        const idStr = encargadoId.toString();
        encargadosSeccionesMap.has(idStr)
          ? encargadosSeccionesMap.get(idStr).push(nombreSeccion)
          : encargadosSeccionesMap.set(idStr, [nombreSeccion]);
      }
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: User[];
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

      [results, total] = await this.userRepository.findAndCount(queryOptions);
      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.userRepository.find({
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

    // Mapear resultados con secciones
    const tutores = await Promise.all(
      results.map(async (user) => ({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        image: user.image,
        isActive: user.isActive,
        secciones: encargadosSeccionesMap.get(user._id.toString()) || [],
      })),
    );

    return new PaginationResponseBuilder()
      .setMessage(
        `Tutores obtenidos exitosamente. Total páginas: ${totalPages}`,
      )
      .setData(tutores)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findAllProfesoresWithPagination(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    // Obtener el rol "recomendador"
    const role = await this.roleCrudHelper.findByNameOrId(
      'profesor',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role 'recomendador' not found`);
    }

    const filter: any = { role: role._id.toString() };

    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i',
      };
    }

    // Obtener todas las secciones con encargados y nombres
    const secciones = await this.seccionRepository.find({
      select: ['encargados', 'nombre'],
    });

    // Crear mapa de ID de encargado a nombres de secciones
    const encargadosSeccionesMap = new Map<string, string[]>();
    for (const seccion of secciones) {
      const nombreSeccion = seccion.nombre;
      for (const encargadoId of seccion.encargados) {
        const idStr = encargadoId.toString();
        encargadosSeccionesMap.has(idStr)
          ? encargadosSeccionesMap.get(idStr).push(nombreSeccion)
          : encargadosSeccionesMap.set(idStr, [nombreSeccion]);
      }
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: User[];
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

      [results, total] = await this.userRepository.findAndCount(queryOptions);
      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.userRepository.find({
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

    const profesores = await Promise.all(
      results.map(async (user) => ({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        image: user.image,
        isActive: user.isActive,
        secciones: encargadosSeccionesMap.get(user._id.toString()) || [],
      })),
    );

    return new PaginationResponseBuilder()
      .setMessage(
        `Profesores retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(profesores)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<GeneralResponseDto<User>> {
    const user = await this.crudHelper.findByNameOrId(id);
    const userUpdate = {
      ...user,
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      userUpdate.password = hashedPassword;
    }
    await this.crudHelper.update(user, userUpdate);

    const role = await this.roleCrudHelper.findByNameOrId(updateUserDto.role);

    //Actualizar el nombre e imagen en la tabla de alumno si tiene el rol de alumno, usar UpdateByUserId

    const alumnoUpdate = {
      nombre: updateUserDto.nombre,
      image: updateUserDto.image,
      email: updateUserDto.email,
    };

    if (role.name === 'alumno') {
      await this.alumnoService.updateByUserId(id, alumnoUpdate);
    }

    return new GeneralResponseBuilder<User>()
      .setMessage('User updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<User>> {
    const user = await this.crudHelper.findByNameOrId(id);
    const userCount = await this.crudHelper.count();
    if (userCount === 1) {
      throw new ConflictException('Cannot delete the only user in the system');
    }

    await this.seccionService.deleteEncargadoFromSeccionesByUserId(id);

    await this.crudHelper.delete(user, true);
    return new GeneralResponseBuilder<User>()
      .setMessage('User deleted successfully')
      .build();
  }

  async updateProfile(
    userId: string,
    role: string,
    idDependingRole: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<GeneralResponseDto<User>> {
    const user = await this.crudHelper.findByNameOrId(userId);

    const updates: Partial<User> = {};

    if (updateProfileDto.image) {
      updates.image = updateProfileDto.image;
    }

    updates.image = updateProfileDto.image;

    if (updateProfileDto.telefono) {
      updates.telefono = updateProfileDto.telefono;
    }

    if (updateProfileDto.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updateProfileDto.password, salt);
    }

    updates.isActive = true;
    await this.crudHelper.update(user, updates);

    const roles = ['recomendador', 'alumno'];

    const actualRole = await this.roleCrudHelper.findByNameOrId(role);
    if (!actualRole) {
      throw new BadRequestException(`Role ${role} not found`);
    }

    if (actualRole.name === roles[1]) {
      await this.postulanteService.createNewAlumno(
        idDependingRole,
        userId,
        user.nombre,
        user.image,
        user.email,
        true,
      );
    }

    return new GeneralResponseBuilder<User>()
      .setMessage('Perfil actualizado exitosamente')
      .build();
  }

  async requestPasswordReset(email: string): Promise<GeneralResponseDto<void>> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return new GeneralResponseBuilder<void>()
          .setStatusCode(404)
          .setMessage(
            'El correo electrónico no está registrado en nuestro sistema',
          )
          .build();
      }

      await this.passwordResetTokenRepository.delete({
        userId: user._id.toString(),
        used: false,
      });

      const token = crypto.randomBytes(32).toString('hex');
      const encodedToken = encodeURIComponent(token);

      const expiresAt = new Date();
      expiresAt.setTime(Date.now() + 3600000);

      await this.passwordResetTokenRepository.manager.transaction(
        async (manager) => {
          await manager.delete(PasswordResetToken, {
            userId: user._id.toString(),
            used: false,
          });

          const newToken = manager.create(PasswordResetToken, {
            userId: user._id.toString(),
            token,
            expiresAt,
            used: false,
          });

          await manager.save(newToken);
        },
      );

      const resetLink = `https://refuerzo-mendoza.me/reset-password?token=${encodedToken}`;

      const sendEmailDto: SendEmailDto = {
        to: [email],
        replyTo: ['soporte@refuerzo-mendoza.me'],
        subject: 'Recuperación de contraseña',
        from: 'soporte@refuerzo-mendoza.me',
        text: `Hola ${user.nombre},\n\nHaz solicitado un cambio de contraseña. Por favor utiliza este enlace para restablecerla: ${resetLink}`,
        html: `Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña.`,
      };

      try {
        await this.emailService.sendEmail(sendEmailDto);
      } catch (error) {
        console.error('Error sending email:', error);
        throw new HttpException(
          'Error enviando el correo de recuperación',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return new GeneralResponseBuilder<void>()
        .setStatusCode(200)
        .setMessage(
          'Si el email está registrado, se ha enviado un enlace de recuperación',
        )
        .build();
    } catch (error) {
      console.error('Error en requestPasswordReset:', error); // Depuración
      throw new HttpException(
        'Error en la solicitud de recuperación de contraseña',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<GeneralResponseDto<void>> {
    const decodedToken = decodeURIComponent(token).trim();

    const currentDate = new Date();

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        token: decodedToken,
        used: false,
        expiresAt: { $gt: currentDate },
      } as any,
    });

    if (!resetToken) {
      const tokensExistentes = await this.passwordResetTokenRepository.find();
      throw new BadRequestException('Token inválido o expirado');
    }

    const userId = new ObjectId(resetToken.userId.toString());

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { _id: userId } as any,
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Actualizar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    // Marcar token como usado
    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    return new GeneralResponseBuilder<void>()
      .setStatusCode(200)
      .setMessage('Contraseña actualizada exitosamente')
      .build();
  }

  async createTutor(
    createNewRecomendadorDto: CreateNewRecomendadorDto,
  ): Promise<GeneralResponseDto<User>> {
    const role = await this.roleCrudHelper.findByNameOrId(
      'tutor',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role tutor not found`);
    }
    const findUser = await this.crudHelper.findByEmailOrId(
      createNewRecomendadorDto.email,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with email ${createNewRecomendadorDto.email} already exists`,
      );
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // Generar una contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = this.userRepository.create({
      nombre: createNewRecomendadorDto.nombre,
      email: createNewRecomendadorDto.email,
      telefono: createNewRecomendadorDto.telefono,
      image: createNewRecomendadorDto.image,
      isActive: false,
      role: role._id.toString(),
      password: hashedPassword,
    });

    await this.crudHelper.create(newUser);

    const sendEmailDto: SendEmailDto = {
      to: [createNewRecomendadorDto.email],
      replyTo: ['soporte@refuerzo-mendoza.me'],
      subject: 'Cuenta de Tutor Creada',
      from: 'soporte@refuerzo-mendoza.me',
      text: `Hola ${createNewRecomendadorDto.nombre},\n\nTu contraseña temporal es: ${temporaryPassword}\nPor favor inicia sesión y cambia tu contraseña.`,
      html: recomendadorAccountCreatedTemplate(
        createNewRecomendadorDto.nombre,
        temporaryPassword,
      ),
    };

    try {
      await this.emailService.sendEmail(sendEmailDto);
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('Tutor created successfully')
      .build();
  }

  async createProfesor(
    createNewRecomendadorDto: CreateNewRecomendadorDto,
  ): Promise<GeneralResponseDto<User>> {
    const role = await this.roleCrudHelper.findByNameOrId(
      'profesor',
      false,
      false,
    );

    if (!role) {
      throw new BadRequestException(`Role profesor not found`);
    }
    const findUser = await this.crudHelper.findByEmailOrId(
      createNewRecomendadorDto.email,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with email ${createNewRecomendadorDto.email} already exists`,
      );
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // Generar una contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = this.userRepository.create({
      nombre: createNewRecomendadorDto.nombre,
      email: createNewRecomendadorDto.email,
      telefono: createNewRecomendadorDto.telefono,
      image: createNewRecomendadorDto.image,
      isActive: false,
      role: role._id.toString(),
      password: hashedPassword,
    });

    await this.crudHelper.create(newUser);

    const sendEmailDto: SendEmailDto = {
      to: [createNewRecomendadorDto.email],
      replyTo: ['soporte@refuerzo-mendoza.me'],
      subject: 'Cuenta de Profesor Creada',
      from: 'soporte@refuerzo-mendoza.me',
      text: `Hola ${createNewRecomendadorDto.nombre},\n\nTu contraseña temporal es: ${temporaryPassword}\nPor favor inicia sesión y cambia tu contraseña.`,
      html: recomendadorAccountCreatedTemplate(
        createNewRecomendadorDto.nombre,
        temporaryPassword,
      ),
    };

    try {
      await this.emailService.sendEmail(sendEmailDto);
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('Profesor created successfully')
      .build();
  }
}
