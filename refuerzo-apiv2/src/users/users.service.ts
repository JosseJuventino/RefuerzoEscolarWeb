import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ObjectId } from 'mongodb';
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
      createUserDto.username,
      false,
      false,
    );
    if (findUser) {
      throw new ConflictException(
        `User with username ${createUserDto.username} already exists`,
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

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const excludedUsernames = ['admin', 'administrador'];

    // Crear el filtro inicial para excluir usuarios específicos
    const filter: any = {
      deletedAt: null,
      username: { $nin: excludedUsernames },
    };

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
    const usersWithRolesAndPermissions = await Promise.all(
      results.map(async (user) => {
        const userRoles = await this.roleCrudHelper.findByNameOrId(
          user.role.toString(),
          false,
          false,
        );

        return {
          ...user,
          role: userRoles
            ? userRoles
            : {
                _id: null,
                name: 'No role',
                pages: {
                  blog: { view: false, edit: false },
                  usuarios: { view: false, edit: false },
                  programacion: { view: false, edit: false },
                  role: { view: false, edit: false },
                },
              },
        };
      }),
    );

    // Construir la respuesta paginada
    return new PaginationResponseBuilder()
      .setMessage(`Users retrieved successfully. Total pages: ${totalPages}`)
      .setData(usersWithRolesAndPermissions)
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
