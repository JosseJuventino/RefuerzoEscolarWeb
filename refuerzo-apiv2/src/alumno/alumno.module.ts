import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnoController } from './controller/alumno.controller';
import { AlumnoService } from './service/alumno.service';
import { Alumno } from './entities/alumno.entity';
import { User } from 'src/users/entities/user.entity';
import { Grado } from 'src/grado/entities/grado.entity';

@Module({
  controllers: [AlumnoController],
  providers: [AlumnoService],
  imports: [CommonModule, TypeOrmModule.forFeature([Alumno, User, Grado])],
  exports: [TypeOrmModule, AlumnoService],
})
export class AlumnoModule {}
