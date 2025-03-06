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
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Tutores')
@Controller('tutores')
@Permission('tutores')
@Resources('tutores')
export class TutorsController {
  constructor(private readonly usersService: UsersService) {}

  @Scopes('view', 'edit')
  @Post()
  @ApiOperation({
    summary: 'Crear un tutor',
    description: 'Crea un nuevo tutor en el sistema',
  })
  @ApiBearerAuth()
  createTutor(@Body() createTutorDto: CreateNewRecomendadorDto) {
    return this.usersService.createTutor(createTutorDto);
  }

  @Scopes('view')
  @Get('pagination')
  @ApiOperation({
    summary: 'Get all tutores with pagination',
    description: 'Get all tutores with pagination',
  })
  @ApiBearerAuth()
  findAllTutoresWithPagination(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllTutoresWithPagination(paginationQuery);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all tutores',
    description: 'Get all tutores',
  })
  @ApiBearerAuth()
  findAllTutores() {
    return this.usersService.findAllTutores();
  }
}
