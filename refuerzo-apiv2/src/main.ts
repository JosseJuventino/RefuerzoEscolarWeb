import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { ThrottlerExceptionFilter } from './users/ThrottlerExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://66.70.189.110',
      'https://refuerzo-mendoza.me',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  // Lee las variables de entorno
  const apiPrefix = configService.get<string>('API_GLOBAL_PREFIX') || 'api';
  const swaggerDocPath =
    configService.get<string>('SWAGGER_DOC_PATH') || 'docs';
  const port = configService.get<number>('PORT') || 3005;

  // Configuración de Swagger con el prefijo correcto
  const config = new DocumentBuilder()
    .setTitle('Refuerzo Escolar Documentation')
    .setVersion('1.0.0')
    .addServer(`/${apiPrefix}`)
    .addServer('/')
    .addBearerAuth({ type: 'http', scheme: 'bearer' })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configura la ruta de Swagger relativa al prefijo global sin repetir el prefijo
  SwaggerModule.setup(`${swaggerDocPath}`, app, document, {
    customCss: `
      .swagger-ui .topbar {
        display: none;
      }
    `,
  });

  // Configuración de validación y filtros globales
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // Inicia la aplicación en el puerto especificado
  await app.listen(port);
}

bootstrap();
