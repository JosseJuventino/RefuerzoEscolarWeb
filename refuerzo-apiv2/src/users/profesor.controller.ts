import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiTags('Profesores')
@Controller('profesor')
@Permission('profesores')
@Resources('profesores')
export class ProfesorController {
  constructor(private readonly usersService: UsersService) {}

  @Scopes('view', 'edit')
  @Post()
  @ApiOperation({
    summary: 'Create a profesor',
    description: 'Create a new profesor',
  })
  @ApiBearerAuth()
  createProfesor(@Body() createUserDto: CreateNewRecomendadorDto) {
    return this.usersService.createProfesor(createUserDto);
  }

  @Scopes('view')
  @Get('pagination')
  @ApiOperation({
    summary: 'Get all profesores with pagination',
    description: 'Get all profesores with pagination',
  })
  @ApiBearerAuth()
  findAllProfesoresWithPagination(
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.usersService.findAllProfesoresWithPagination(paginationQuery);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all profesores',
    description: 'Get all profesores',
  })
  @ApiBearerAuth()
  findAllProfesores() {
    return this.usersService.findAllProfesores();
  }
}
