import { Module, forwardRef } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaController } from './controller/asistencia.controller';
import { AsistenciaService } from './service/asistencia.service';
import { Asistencia } from './entities/asistencia.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { Alumno } from 'src/alumno/entities/alumno.entity';
import { SeccionModule } from 'src/seccion/seccion.module';
import { Seccion } from 'src/seccion/entities/seccion.entity';

@Module({
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Asistencia, User, Alumno, Seccion]),
    forwardRef(() => UsersModule),
    forwardRef(() => SeccionModule),
  ],
  exports: [TypeOrmModule, AsistenciaService],
})
export class AsistenciaModule {}
