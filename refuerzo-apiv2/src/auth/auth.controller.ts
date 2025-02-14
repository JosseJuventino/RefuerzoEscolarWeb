import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Request as RequestNest,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { PageverifyDto } from './dto/pageverify.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Request } from 'express';
import { Resources, Scopes } from 'nest_autorization';
import { Permission } from 'src/common/decorators/permission.decorators';

@ApiBasicAuth()
@Permission('usuarios')
@Resources('usuarios')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() authDto: AuthDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.login(authDto, ipAddress, userAgent);
  }

  @Scopes('view')
  @Get('logs')
  @ApiOperation({
    summary: 'Obtener registros de auditoría de inicio de sesion',
    description:
      'Obtiene los registros de auditoría de inicio de sesión del usuario',
  })
  @ApiBearerAuth()
  async getLogs(@RequestNest() req) {
    const userId = req.user?.id;
    return this.authService.getAuditLogsByUser(userId);
  }
}
