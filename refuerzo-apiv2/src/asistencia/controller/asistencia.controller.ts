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
import { AsistenciaService } from '../service/asistencia.service';
import { CreateAsistenciaDto } from '../dto/create-asistencia.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { UpdateAsistenciaDto } from '../dto/update-asistencia.dto';
import { AsistenciaAddAlumnoDto } from '../dto/add-alumno.dto';
import { AsistenciaAddEncargadoDto } from '../dto/add-encargado.dto';

@ApiBasicAuth()
@Permission('asistencias')
@Resources('asistencias')
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly AsistenciaService: AsistenciaService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Asistencia',
    description: 'Create a Asistencia',
  })
  @ApiBearerAuth()
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.AsistenciaService.create(createAsistenciaDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Asistencias',
    description: 'Get all Asistencias',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.AsistenciaService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a asistencia of alumnos by seccion id',
    description: 'Get a asistencia of alumnos by seccion id',
  })
  @ApiBearerAuth()
  @Get('alumnos/:id')
  findAlumnosBySeccionId(@Param('id') id: string) {
    return this.AsistenciaService.findAlumnosBySeccionId(id);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a asistencia of alumnos by seccion id',
    description: 'Get a asistencia of alumnos by seccion id',
  })
  @ApiBearerAuth()
  @Get('encargados/:id')
  findEncargadosBySeccionId(@Param('id') id: string) {
    return this.AsistenciaService.findEncargadosBySeccionId(id);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Asistencia by seccion id',
    description: 'Get a Asistencia by seccion id',
  })
  @ApiBearerAuth()
  @Get('seccion/:id')
  findBySeccion(@Param('id') id: string) {
    return this.AsistenciaService.findAsistenciaBySeccionId(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Add alumno to asistencia by seccion id',
    description: 'Add alumno to asistencia by seccion id',
  })
  @ApiBearerAuth()
  @Patch('alumno/:id')
  addAlumnoToAsistenciaBySeccionId(
    @Param('id') id: string,
    @Body() addAlumnoDto: AsistenciaAddAlumnoDto,
  ) {
    return this.AsistenciaService.addAlumnoToAsistenciaBySeccionId(
      id,
      addAlumnoDto,
    );
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Add encargado to asistencia by seccion id',
    description: 'Add encargado to asistencia by seccion id',
  })
  @ApiBearerAuth()
  @Patch('encargado/:id')
  addEncargadoToAsistenciaBySeccionId(
    @Param('id') id: string,
    @Body() addEncargadoDto: AsistenciaAddEncargadoDto,
  ) {
    return this.AsistenciaService.addEncargadoToAsistenciaBySeccionId(
      id,
      addEncargadoDto,
    );
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Asistencia by id',
    description: 'Update a Asistencia by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.AsistenciaService.update(id, updateAsistenciaDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Asistencia by id',
    description: 'Delete a Asistencia by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.AsistenciaService.remove(id);
  }
}
