import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { SeccionService } from '../service/seccion.service';
import { CreateSeccionDto } from '../dto/create-seccion.dto';
import { UpdateSeccionDto } from '../dto/update-seccion.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiBasicAuth()
@Permission('alumnos')
@Resources('alumnos')
@Controller('seccion')
export class SeccionController {
  constructor(private readonly SeccionService: SeccionService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Seccion',
    description: 'Create a Seccion',
  })
  @ApiBearerAuth()
  create(@Body() createSeccionDto: CreateSeccionDto) {
    return this.SeccionService.create(createSeccionDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Seccions',
    description: 'Get all Seccions',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.SeccionService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Seccion by id',
    description: 'Get a Seccion by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.SeccionService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Seccion by id',
    description: 'Update a Seccion by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeccionDto: UpdateSeccionDto) {
    return this.SeccionService.update(id, updateSeccionDto);
  }


  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Seccion by slug',
    description: 'Get a Seccion by slug',
  })
  @ApiBearerAuth()
  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const seccion = await this.SeccionService.findOneBySlug(slug);
    if (!seccion) {
      throw new NotFoundException(`Sección con slug "${slug}" no encontrada`);
    }
    return seccion;
  }


  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Seccion by id',
    description: 'Delete a Seccion by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.SeccionService.remove(id);
  }
}
