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

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    CommonModule,
    RolesModule,
    TypeOrmModule.forFeature([User, Postulante]),
    EmailModule,
    forwardRef(() => AlumnoModule), // Usar forwardRef
    forwardRef(() => PostulanteModule), // Usar forwardRef
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
