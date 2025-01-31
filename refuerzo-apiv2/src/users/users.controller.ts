import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Scope,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';

@ApiBasicAuth()
@Permission('usuarios')
@Resources('usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Scopes('view', 'edit')
  @Post('recomendador')
  @ApiOperation({
    summary: 'Create a recomendador',
    description: 'Create a new recomendador',
  })
  @ApiBearerAuth()
  createRecomendador(
    @Body() createNewRecomendadorDto: CreateNewRecomendadorDto,
  ) {
    return this.usersService.createRecomendador(createNewRecomendadorDto);
  }

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'Create a new user',
  })
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Scopes('view')
  @Get('recomendador')
  @ApiOperation({
    summary: 'Get all recomendadores',
    description: 'Get all recomendadores',
  })
  @ApiBearerAuth()
  findAllRecomendadores(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllRecomendadores(paginationQuery);
  }

  @Scopes('view')
  @Get('alumno')
  @ApiOperation({
    summary: 'Get all alumnos',
    description: 'Get all alumnos',
  })
  @ApiBearerAuth()
  findAllAlumnos(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllAlumnos(paginationQuery);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get all users',
  })
  @Public()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a user by id',
    description: 'Get a user by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a user by id',
    description: 'Update a user by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a user by id',
    description: 'Delete a user by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
