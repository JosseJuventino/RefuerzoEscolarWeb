import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Scope,
  Request,
  Query,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Profile')
@Controller('profile')
@Permission('profile')
@Resources('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Scopes('view', 'edit')
  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario actual',
    description:
      'Actualiza imagen, teléfono y/o contraseña del usuario autenticado',
  })
  @ApiBearerAuth()
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.usersService.updateProfile(
      req.user.id,
      req.user.role,
      req.user.idDependingRole,
      updateProfileDto,
    );
  }
}
