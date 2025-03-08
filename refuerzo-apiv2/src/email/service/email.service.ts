import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SendEmailDto } from '../dto/send-email.dto';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private ses: AWS.SES;

  constructor(private readonly configService: ConfigService) {
    this.ses = new AWS.SES({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async sendEmail(
    sendEmailDto: SendEmailDto,
    userId?: string,
  ): Promise<GeneralResponseDto<any>> {
    try {
      this.logger.log(
        `Iniciando envío de email por usuario: ${userId || 'sistema'}`,
      );

      const params: AWS.SES.SendEmailRequest =
        this.buildSESParams(sendEmailDto);

      const result = await this.ses.sendEmail(params).promise();

      this.logger.log(
        `Email enviado exitosamente. MessageID: ${result.MessageId}`,
      );

      return new GeneralResponseBuilder()
        .setStatusCode(201)
        .setMessage('Correo electrónico enviado exitosamente')
        .setData({
          messageId: result.MessageId,
          timestamp: new Date().toISOString(),
        })
        .build();
    } catch (error) {
      this.handleSesError(error);
    }
  }

  private buildSESParams(sendEmailDto: SendEmailDto): AWS.SES.SendEmailRequest {
    return {
      Source: `"${this.configService.get('AWS_SES_SENDER_NAME')}" <${sendEmailDto.from || this.configService.get('AWS_SES_SENDER_EMAIL')}>`,
      Destination: {
        ToAddresses: sendEmailDto.to,
        CcAddresses: sendEmailDto.cc,
        BccAddresses: sendEmailDto.bcc,
      },
      Message: {
        Body: {
          ...(sendEmailDto.text && { Text: { Data: sendEmailDto.text } }),
          ...(sendEmailDto.html && { Html: { Data: sendEmailDto.html } }),
        },
        Subject: {
          Data: sendEmailDto.subject,
          Charset: 'UTF-8',
        },
      },
      ReplyToAddresses: sendEmailDto.replyTo,
    };
  }

  private handleSesError(error: AWS.AWSError): void {
    this.logger.error(`Error SES: ${error.message}`, error.stack);

    if (error.code === 'InvalidParameterValue') {
      throw new BadRequestException(
        `Error en configuración del correo: ${error.message}`,
      );
    }

    if (error.code === 'MessageRejected') {
      throw new BadRequestException(
        `El mensaje fue rechazado: ${error.message}`,
      );
    }

    throw new InternalServerErrorException(
      'Error al procesar el correo electrónico',
    );
  }
}
