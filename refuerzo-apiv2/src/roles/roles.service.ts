import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CrudHelper } from '../common/helper/crud.helper';
import { Role } from './entities/role.entity';
import { Repository, FindManyOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesService {
  private readonly crudHelper: CrudHelper<Role>;
  private readonly usersCrudHelper: CrudHelper<User>;
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.crudHelper = new CrudHelper<Role>(this.roleRepository, 'Roles');
    this.usersCrudHelper = new CrudHelper<User>(this.userRepository, 'Users');
  }

  async create(
    createRoleDto: CreateRoleDto,
  ): Promise<GeneralResponseDto<Role>> {
    const findRole = await this.crudHelper.findByNameOrId(
      createRoleDto.name,
      false,
      false,
    );
    if (findRole) {
      throw new ConflictException(
        `Role with name ${createRoleDto.name} already exists`,
      );
    }
    const newRole = this.roleRepository.create(createRoleDto);
    await this.crudHelper.create(newRole);
    return new GeneralResponseBuilder<Role>()
      .setStatusCode(201)
      .setMessage('Role created successfully')
      .build();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<Role>> {
    // Definir los nombres de roles a excluir en minúsculas
    const excludedRoles = ['admin', 'administrador'];

    // Crear el filtro para excluir roles
    const filter: any = {
      deletedAt: null,
      name: { $nin: excludedRoles },
    };

    // Aplicar filtros adicionales si existen
    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      // Usar expresión regular para búsqueda insensible a mayúsculas
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i',
      };
    }

    // Verificar si se deben aplicar paginación
    const applyPagination = paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: Role[];
    let total: number;
    let totalPages: number;

    if (applyPagination) {
      const queryOptions: FindManyOptions<Role> = {
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

      // Realizar la consulta con paginación y filtrado
      [results, total] = await this.roleRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Verificar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }

      // Construir y devolver la respuesta paginada
      return new PaginationResponseBuilder<Role>()
        .setMessage('Roles retrieved successfully')
        .setSize(results.length)
        .setData(results)
        .setTotalPages(totalPages)
        .setPage(paginationQuery.page)
        .setLimit(paginationQuery.limit)
        .build();
    } else {
      // Si no se proporcionaron parámetros de paginación, devolver todos los roles
      results = await this.roleRepository.find({
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

      return new PaginationResponseBuilder<Role>()
        .setMessage('All roles retrieved successfully')
        .setSize(total)
        .setData(results)
        .setTotalPages(totalPages)
        .setPage(1)
        .setLimit(total) // As all items are returned
        .build();
    }
  }

  async findOne(id: string): Promise<GeneralResponseDto<Role>> {
    const role = await this.crudHelper.findByNameOrId(id);
    return new GeneralResponseBuilder<Role>()
      .setMessage('Role retrieved successfully')
      .setData(role)
      .build();
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<GeneralResponseDto<Role>> {
    const role = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.update(role, updateRoleDto);
    return new GeneralResponseBuilder<Role>()
      .setMessage('Role updated successfully')
      .build();
  }

  async remove(id: string) {
    const role = await this.crudHelper.findByNameOrId(id);
    //Validar que ningun usuario tenga el rol
    const usersbyRole = await this.usersCrudHelper.findOne(
      {
        where: { role: role._id.toString() },
      },
      false,
    );
    if (usersbyRole) {
      throw new ConflictException(
        `Role ${role.name} is assigned to a user. Please reassign the role to another user before deleting`,
      );
    }
    await this.crudHelper.delete(role, true);
    return new GeneralResponseBuilder<Role>()
      .setMessage('Role deleted successfully')
      .build();
  }
}
