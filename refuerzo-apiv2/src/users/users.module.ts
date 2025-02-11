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

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    CommonModule,
    RolesModule,
    TypeOrmModule.forFeature([User, Postulante]),
    TypeOrmModule.forFeature([PasswordResetToken]),
    EmailModule,
    forwardRef(() => AlumnoModule), 
    forwardRef(() => PostulanteModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
