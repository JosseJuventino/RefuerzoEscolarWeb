import { Controller, Post, Body, UseFilters, Request } from '@nestjs/common';
import { EmailService } from '../service/email.service';
import { SendEmailDto } from '../dto/send-email.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import { Public } from 'src/common/decorators/public.decorators';
import { send } from 'process';

@ApiBasicAuth()
@Permission('email')
@Resources('email')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Scopes('view', 'edit')
  @Post()
  @ApiOperation({
    summary: 'Enviar correo electrónico',
    description: 'Envía un correo electrónico a través de AWS SES',
  })
  @ApiBearerAuth()
  async sendEmail(@Request() req, @Body() sendEmailDto: SendEmailDto) {
    const userId = req.user?.id;
    return this.emailService.sendEmail(sendEmailDto, userId);
  }
}
