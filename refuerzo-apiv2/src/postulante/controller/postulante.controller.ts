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
import { PostulanteService } from '../service/postulante.service';
import { CreatePostulanteDto } from '../dto/create-postulante.dto';
import { UpdatePostulanteDto } from '../dto/update-postulante.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';

@ApiTags('Postulantes')
@Permission('postulantes')
@Resources('postulantes')
@ApiBearerAuth()
@Controller('postulantes')
export class PostulanteController {
  constructor(private readonly postulanteService: PostulanteService) {}

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a postulante',
    description: 'Create a new postulante',
  })
  create(@Request() req, @Body() createUserDto: CreatePostulanteDto) {
    return this.postulanteService.create(req.user.id, createUserDto);
  }

  @Scopes('view')
  @Get('me')
  @ApiOperation({
    summary: 'Get all postulantes',
    description: 'Get all postulantes',
  })
  @ApiBearerAuth()
  findAllByRecomendador(@Request() req,@Query() paginationQuery: PaginationQueryDto) {
    return this.postulanteService.findAllByRecomendador(req.user.id, paginationQuery);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all postulantes',
    description: 'Get all postulantes',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.postulanteService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a postulante by id',
    description: 'Get a postulante by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postulanteService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a postulante by id',
    description: 'Update a postulante by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdatePostulanteDto) {
    return this.postulanteService.update(id, updateUserDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a postulante by id',
    description: 'Delete a postulante by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postulanteService.remove(id);
  }
}
