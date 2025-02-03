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
import { GradoService } from '../service/grado.service';
import { CreateGradoDto } from '../dto/create-grado.dto';
import { UpdateGradoDto } from '../dto/update-grado.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiBasicAuth()
@Permission('grado')
@Resources('grado')
@Controller('grado')
export class GradoController {
  constructor(private readonly GradoService: GradoService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Grado',
    description: 'Create a Grado',
  })
  @ApiBearerAuth()
  create(@Body() createGradoDto: CreateGradoDto) {
    return this.GradoService.create(createGradoDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Grados',
    description: 'Get all Grados',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.GradoService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Grado by id',
    description: 'Get a Grado by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.GradoService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Grado by id',
    description: 'Update a Grado by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGradoDto: UpdateGradoDto) {
    return this.GradoService.update(id, updateGradoDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Grado by id',
    description: 'Delete a Grado by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.GradoService.remove(id);
  }
}
