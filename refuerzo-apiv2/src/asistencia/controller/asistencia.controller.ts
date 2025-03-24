import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AsistenciaService } from '../service/asistencia.service';
import { CreateAsistenciaDto } from '../dto/create-asistencia.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { UpdateAsistenciaDto } from '../dto/update-asistencia.dto';
import { ArrayAsistenciaAddAlumnoDto } from '../dto/add-alumno.dto';
import { AsistenciaAddEncargadoDto } from '../dto/add-encargado.dto';
import { UpdateAlumnoRegistroDto } from '../dto/update-register.dto';
import { UpdateEncargadoRegistroDto } from '../dto/update-register.dto';

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
    summary: 'Get an alumnos register by seccionId and date',
    description: 'Get an alumnos register by seccionId and date',
  })
  @ApiBearerAuth()
  @Get('seccion/:id/alumnos')
  findAlumnosBySeccionIdAndDate(
    @Param('id') seccionId: string,
    @Query('date') date: string,
  ) {
    return this.AsistenciaService.findAlumnosBySeccionAndDate(seccionId, date);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a encargados register by seccionId and date',
    description: 'Get a encargados register by seccionId and date',
  })
  @ApiBearerAuth()
  @Get('seccion/:id/encargados')
  findEncargadosBySeccionIdAndDate(
    @Param('id') seccionId: string,
    @Query('date') date: string,
  ) {
    return this.AsistenciaService.findEncargadosBySeccionAndDate(
      seccionId,
      date,
    );
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a encargados register by month and year',
    description: 'Get a encargados register by month and year',
  })
  @ApiBearerAuth()
  @Get('seccion/:id/encargados-agrupados')
  getEncargadosGroupedByDate(
    @Param('id') seccionId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.AsistenciaService.getEncargadosGroupedByDate(
      seccionId,
      month,
      year,
    );
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get an alumnos register by month and year',
    description: 'Get an alumnos register by month and year',
  })
  @ApiBearerAuth()
  @Get('seccion/:id/alumnos-agrupados')
  getAlumnosGroupedByDate(
    @Param('id') seccionId: string,
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
  ) {
    return this.AsistenciaService.getAlumnosGroupedByDate(
      seccionId,
      month,
      year,
    );
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get an alumno register',
    description: 'Get an alumno register',
  })
  @ApiBearerAuth()
  @Get('alumno/register/:id')
  findAlumnoById(@Param('id') id: string) {
    return this.AsistenciaService.findAlumnoById(id);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get an encargado register',
    description: 'Get an encargado register',
  })
  @ApiBearerAuth()
  @Get('encargado/register/:id')
  findEncargadoById(@Param('id') id: string) {
    return this.AsistenciaService.findEncargadoById(id);
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
  @Post('alumno/:id')
  addAlumnoToAsistenciaBySeccionId(
    @Param('id') id: string,
    @Body() addAlumnoDto: ArrayAsistenciaAddAlumnoDto,
  ) {
    return this.AsistenciaService.addAlumnosToAsistenciaBySeccionId(
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
  @Post('encargado/:id')
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
    summary: 'Update an alumno register by register id',
    description: 'Update an alumno register by register id',
  })
  @ApiBearerAuth()
  @Patch('alumno/register/:id')
  updateAlumnoRegister(
    @Param('id') id: string,
    @Body() updateDto: UpdateAlumnoRegistroDto,
  ) {
    return this.AsistenciaService.updateAlumnoRegister(id, updateDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update an encargado register by register id',
    description: 'Update a encargado register by register id',
  })
  @ApiBearerAuth()
  @Patch('encargado/register/:id')
  updateEncargadoRegister(
    @Param('id') id: string,
    @Body() updateDto: UpdateEncargadoRegistroDto,
  ) {
    return this.AsistenciaService.updateEncargadoRegister(id, updateDto);
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
