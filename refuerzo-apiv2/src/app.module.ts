import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './databases/mongo.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PostulanteModule } from './postulante/postulante.module';
import { EmailModule } from './email/email.module';
import { GradoModule } from './grado/grado.module';
import { ProgramaModule } from './programa/programa.module';
import { AlumnoModule } from './alumno/alumno.module';
import { DocumentsModule } from './document/document.module';
import { SeccionModule } from './seccion/seccion.module';
import { PublicacionModule } from './publicacion/publicacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      // validationSchema: environmentValidations,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Ruta local a la carpeta "uploads"
      serveRoot: '/uploads', // Ruta pública para acceder a los archivos (http://localhost:3000/uploads)
    }),
    UsersModule,
    MongoModule,
    CommonModule,
    RolesModule,
    AuthModule,
    ImagesModule,
    PostulanteModule,
    EmailModule,
    GradoModule,
    ProgramaModule,
    AlumnoModule,
    DocumentsModule,
    SeccionModule,
    PublicacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
