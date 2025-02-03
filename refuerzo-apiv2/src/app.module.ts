import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { environmentValidations } from './config/validation-schema';
import { MongoModule } from './databases/mongo.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PostulanteModule } from './postulante/postulante.module';
import { RecomendadorModule } from './recomendadores/recomendador.module';
import { EmailModule } from './email/email.module';
import { GradoModule } from './grado/grado.module';
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
    RecomendadorModule,
    EmailModule,
    GradoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
