import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ObjectId } from 'mongodb';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CrudHelper } from '../common/helper/crud.helper';
import { User } from './entities/user.entity';
import { Repository, FindManyOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { Role } from 'src/roles/entities/role.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly crudHelper: CrudHelper<User>;
  private readonly roleCrudHelper: CrudHelper<Role>;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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
    const findUser = await this.crudHelper.findByNameOrId(
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
    const findUser = await this.crudHelper.findByNameOrId(
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
    //Paso para encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const newUser = this.userRepository.create({
      nombre: createNewRecomendadorDto.nombre,
      email: createNewRecomendadorDto.email,
      telefono: createNewRecomendadorDto.telefono,
      image: createNewRecomendadorDto.image,
      role: role._id.toString(),
      password: hashedPassword,
    });

    await this.crudHelper.create(newUser);

    return new GeneralResponseBuilder<User>()
      .setStatusCode(201)
      .setMessage('Recomendador created successfully')
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

    // Filtrar por el rol "recomendador"
    const filter: any = { role: role._id.toString() };

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
    const recomendadores = await Promise.all(
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
      .setMessage(
        `Recomendadores retrieved successfully. Total pages: ${totalPages}`,
      )
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
}
