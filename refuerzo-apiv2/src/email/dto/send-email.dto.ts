import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'IsTextOrHtml', async: false })
export class IsTextOrHtmlConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as SendEmailDto;
    return !!dto.text || !!dto.html;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Debe proporcionar al menos un cuerpo de texto (text) o HTML';
  }
}

export class SendEmailDto {
  @ApiProperty({
    description: 'Destinatarios principales',
    example: ['correo1@example.com', 'correo2@example.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  to: string[];

  @ApiProperty({
    description: 'Asunto del correo electrónico',
    example: 'Bienvenido a nuestra plataforma',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Cuerpo del correo en texto plano',
    required: false,
    example: 'Gracias por registrarte en nuestro servicio',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'Cuerpo del correo en HTML',
    required: false,
    example: '<h1>Bienvenido</h1><p>Gracias por registrarte</p>',
  })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiProperty({
    description: 'Remitente del correo (opcional si está configurado en SES)',
    example: 'no-reply@tu-dominio.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  from?: string;

  @ApiProperty({
    description: 'Destinatarios en copia (CC)',
    required: false,
    example: ['cc1@example.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @ApiProperty({
    description: 'Destinatarios en copia oculta (BCC)',
    required: false,
    example: ['bcc1@example.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];

  @ApiProperty({
    description: 'Direcciones de respuesta',
    required: false,
    example: ['soporte@tu-dominio.com'],
    type: [String],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  replyTo?: string[];
}