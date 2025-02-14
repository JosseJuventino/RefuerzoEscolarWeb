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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { PageverifyDto } from './dto/pageverify.dto';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Request } from 'express';
@Controller('auth')
@ApiBasicAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() authDto: AuthDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress; // Obtener la dirección IP
    const userAgent = req.headers['user-agent'] || 'Unknown'; // Obtener el User-Agent
    return this.authService.login(authDto, ipAddress, userAgent);
  }
}
