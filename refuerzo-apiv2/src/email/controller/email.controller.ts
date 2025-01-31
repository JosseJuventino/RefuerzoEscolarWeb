import {
    Controller,
    Post,
    Body,
    UseFilters,
    Request,
  } from '@nestjs/common';
  import { EmailService } from '../service/email.service';
  import { SendEmailDto } from '../dto/send-email.dto';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { Public } from 'src/common/decorators/public.decorators';
  
  @ApiTags('Emails')
  @Permission('emails')
  @Resources('emails')
  @ApiBearerAuth()
  @Controller('emails')
  export class EmailController {
    constructor(private readonly emailService: EmailService) {}
  
    @Scopes('edit')
    @Post()
    @ApiOperation({
      summary: 'Enviar correo electrónico',
      description: 'Envía un correo electrónico a través de AWS SES',
    })
    @ApiResponse({
      status: 201,
      description: 'Correo enviado exitosamente',
    })
    @ApiResponse({
      status: 400,
      description: 'Datos de entrada inválidos',
    })
    @ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    })
        
    @Public() 
    async sendEmail(
      @Request() req,
      @Body() sendEmailDto: SendEmailDto
    ) {
      // Si necesitas registrar quién envía el correo
      const userId = req.user?.id;
      return this.emailService.sendEmail(sendEmailDto, userId);
    }
  }