import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CrudHelper } from '../common/helper/crud.helper';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions, MoreThan } from 'typeorm';
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
    @Inject(forwardRef(() => AlumnoService))
    private readonly alumnoService: AlumnoService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PostulanteService))
    private readonly postulanteService: PostulanteService,
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

    // Crear un nuevo alumno asociado al usuario
    const createNewAlumno: CreateAlumnoDto = {
      userId: savedUser._id.toString(),
      gradoId: createNewAlumnoDto.grado,
      cursosId: [],
    };

    await this.alumnoService.create(createNewAlumno);

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
      await this.postulanteService.updateIsUser(idDependingRole, true);
    }

    return new GeneralResponseBuilder<User>()
      .setMessage('Perfil actualizado exitosamente')
      .build();
  }

  async requestPasswordReset(email: string): Promise<GeneralResponseDto<void>> {
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
    const expiresAt = new Date();
    expiresAt.setUTCHours(expiresAt.getUTCHours() + 1);

    const resetToken = this.passwordResetTokenRepository.create({
      userId: user._id.toString(),
      token,
      expiresAt: expiresAt.toISOString(), 
      used: false,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    const resetLink = `https://refuerzo-mendoza.me/reset-password?token=${token}`;

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
    }

    return new GeneralResponseBuilder<void>()
      .setStatusCode(200)
      .setMessage(
        'Si el email está registrado, se ha enviado un enlace de recuperación',
      )
      .build();
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<GeneralResponseDto<void>> {
    const decodedToken = decodeURIComponent(token).trim();

    const resetToken = await this.passwordResetTokenRepository
      .createQueryBuilder('token')
      .where('token.token = :token', { token: decodedToken })
      .andWhere('token.used = false')
      .andWhere('token.expiresAt > CURRENT_TIMESTAMP') 
      .getOne();

    if (!resetToken) {
      console.log('Token inválido o expirado - recibido:', decodedToken);
      throw new BadRequestException('Enlace inválido o expirado');
    }

    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(resetToken.userId) },
    });

    if (!user) {
      console.error('Usuario no encontrado para el token:', resetToken);
      throw new BadRequestException('Error al recuperar la cuenta');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    console.log(`Contraseña actualizada para usuario: ${user.email}`);
    
    return new GeneralResponseBuilder<void>()
      .setStatusCode(200)
      .setMessage('Contraseña actualizada exitosamente')
      .build();
  }
}
