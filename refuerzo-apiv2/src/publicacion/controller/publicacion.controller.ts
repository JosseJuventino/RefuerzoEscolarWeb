import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { PublicacionService } from '../service/publicacion.service';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { UpdatePublicacionDto } from '../dto/update-publicacion.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
@ApiBasicAuth()
@Permission('document')
@Resources('document')
@Controller('publicacion')
export class PublicacionController {
  constructor(private readonly PublicacionService: PublicacionService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a Publicacion',
    description: 'Create a Publicacion',
  })
  @ApiBearerAuth()
  create(@Request() req, @Body() createPublicacionDto: CreatePublicacionDto) {
    const userName = req.user.name;
    const userId = req.user.id;

    return this.PublicacionService.create(
      userName,
      userId,
      createPublicacionDto,
    );
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all Publicacions',
    description: 'Get all Publicacions',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.PublicacionService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a Publicacion by id',
    description: 'Get a Publicacion by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.PublicacionService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a Publicacion by id',
    description: 'Update a Publicacion by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePublicacionDto: UpdatePublicacionDto,
  ) {
    const userName = req.user.name;
    const userId = req.user.id;

    return this.PublicacionService.update(
      id,
      userName,
      userId,
      updatePublicacionDto,
    );
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a Publicacion by id',
    description: 'Delete a Publicacion by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userRole = req.user.role;
    return this.PublicacionService.remove(id, userRole);
  }
}
