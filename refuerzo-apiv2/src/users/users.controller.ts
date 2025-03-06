import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Scope,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Public } from 'src/common/decorators/public.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { CreateNewRecomendadorDto } from './dto/create-recomendador.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto.ts';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RecaptchaService } from './recaptcha.service';
import { Throttle } from '@nestjs/throttler';

@ApiBasicAuth()
@Permission('usuarios')
@Resources('usuarios')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  @Scopes('view', 'edit')
  @Post('recomendador')
  @ApiOperation({
    summary: 'Create a recomendador',
    description: 'Create a new recomendador',
  })
  @ApiBearerAuth()
  createRecomendador(
    @Body() createNewRecomendadorDto: CreateNewRecomendadorDto,
  ) {
    return this.usersService.createRecomendador(createNewRecomendadorDto);
  }

  @Post('request-password-reset')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    const { email, token } = requestPasswordResetDto;

    try {
      await this.recaptchaService.verifyRecaptcha(token);
      return this.usersService.requestPasswordReset(email);
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      throw new HttpException(
        'Error en la solicitud de recuperación de contraseña',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password',
  })
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Scopes('edit')
  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'Create a new user',
  })
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Scopes('view')
  @Get('recomendador')
  @ApiOperation({
    summary: 'Get all recomendadores',
    description: 'Get all recomendadores',
  })
  @ApiBearerAuth()
  findAllRecomendadores(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllRecomendadores(paginationQuery);
  }

  @Scopes('view')
  @Get('alumno')
  @ApiOperation({
    summary: 'Get all alumnos',
    description: 'Get all alumnos',
  })
  @ApiBearerAuth()
  findAllAlumnos(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllAlumnos(paginationQuery);
  }

  @Scopes('view')
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get all users',
  })
  @ApiBearerAuth()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Scopes('view')
  @ApiOperation({
    summary: 'Get a user by id',
    description: 'Get a user by id',
  })
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Update a user by id',
    description: 'Update a user by id',
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Scopes('view', 'edit')
  @ApiOperation({
    summary: 'Delete a user by id',
    description: 'Delete a user by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
