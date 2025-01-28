import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { PageverifyDto } from './dto/pageverify.dto';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('auth')
@ApiBasicAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }
}
