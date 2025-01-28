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
import { RecomendadorService } from '../service/recomendador.service';
import { CreateRecomendadorDto } from '../dto/create-recomendador.dto';
import { UpdateRecomendadorDto } from '../dto/update-recomendador.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiBasicAuth()
@Permission('recomendadores')
@Resources('recomendadores')
@Controller('recomendadores')
export class RecomendadorController {
  constructor(private readonly RecomendadorService: RecomendadorService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Recomendador',
    description: 'Create a new Recomendador',
  })
  @Public()
  create(@Body() createUserDto: CreateRecomendadorDto) {
    return this.RecomendadorService.create(createUserDto);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Recomendadors',
    description: 'Get all Recomendadors',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.RecomendadorService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Recomendador by id',
    description: 'Get a Recomendador by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.RecomendadorService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Recomendador by id',
    description: 'Update a Recomendador by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateRecomendadorDto) {
    return this.RecomendadorService.update(id, updateUserDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Recomendador by id',
    description: 'Delete a Recomendador by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.RecomendadorService.remove(id);
  }
}
