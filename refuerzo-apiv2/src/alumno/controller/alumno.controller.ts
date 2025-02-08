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
import { AlumnoService } from '../service/alumno.service';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { UpdateAlumnoDto } from '../dto/update-alumno.dto';

@ApiBasicAuth()
@Permission('alumnos')
@Resources('alumnos')
@Controller('alumno')
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Alumno',
    description: 'Create a Alumno',
  })
  @ApiBearerAuth()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Alumnos',
    description: 'Get all Alumnos',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.alumnoService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Alumno by id',
    description: 'Get a Alumno by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alumnoService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Alumno by id',
    description: 'Update a Alumno by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlumnoDto: UpdateAlumnoDto) {
    return this.alumnoService.update(id, updateAlumnoDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Alumno by id',
    description: 'Delete a Alumno by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alumnoService.remove(id);
  }
}
