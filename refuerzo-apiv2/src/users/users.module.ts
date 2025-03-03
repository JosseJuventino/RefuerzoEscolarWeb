import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { EmailModule } from '../email/email.module';
import { Postulante } from 'src/postulante/entities/postulante.entity';
import { AlumnoModule } from 'src/alumno/alumno.module';
import { PostulanteModule } from 'src/postulante/postulante.module';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token';
import { RecaptchaService } from './recaptcha.service';
import { RecaptchaModule } from './recaptcha.module';
import { SeccionModule } from 'src/seccion/seccion.module';
import { Seccion } from 'src/seccion/entities/seccion.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    CommonModule,
    RolesModule,
    TypeOrmModule.forFeature([User, Postulante, Seccion]),
    TypeOrmModule.forFeature([PasswordResetToken]),
    EmailModule,
    RecaptchaModule,
    SeccionModule,
    forwardRef(() => AlumnoModule),
    forwardRef(() => PostulanteModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
