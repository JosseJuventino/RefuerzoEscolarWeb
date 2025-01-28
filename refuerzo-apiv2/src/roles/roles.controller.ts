import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiBasicAuth()
@Permission('role')
@Controller('roles')
@Resources('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Scopes('edit')
  @ApiOperation({
    summary: 'Create a role',
    description: 'Create a new role',
  })
  @ApiBearerAuth()
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Get all roles',
  })
  @ApiBearerAuth()
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.rolesService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a role by id',
    description: 'Get a role by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a role',
    description: 'Update a role',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a role',
    description: 'Delete a role',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
