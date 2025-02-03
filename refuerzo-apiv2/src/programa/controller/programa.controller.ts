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
import { ProgramaService } from '../service/programa.service';
import { CreateProgramaDto } from '../dto/create-programa.dto';
import { UpdateProgramaDto } from '../dto/update-programa.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiBasicAuth()
@Permission('programa')
@Resources('programa')
@Controller('programa')
export class ProgramaController {
  constructor(private readonly programaService: ProgramaService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Programa',
    description: 'Create a Programa',
  })
  @ApiBearerAuth()
  create(@Body() createProgramaDto: CreateProgramaDto) {
    return this.programaService.create(createProgramaDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Programas',
    description: 'Get all Programas',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.programaService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Programa by id',
    description: 'Get a Programa by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programaService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Programa by id',
    description: 'Update a Programa by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramaDto: UpdateProgramaDto,
  ) {
    return this.programaService.update(id, updateProgramaDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Programa by id',
    description: 'Delete a Programa by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programaService.remove(id);
  }
}
