import { Module, forwardRef } from '@nestjs/common';
import { SeccionService } from './service/seccion.service';
import { SeccionController } from './controller/seccion.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seccion } from './entities/seccion.entity';
import { GradoModule } from 'src/grado/grado.module'; // Importar GradoModule
import { Grado } from 'src/grado/entities/grado.entity';
import { PublicacionModule } from 'src/publicacion/publicacion.module'; // Importar PublicacionModule
import { Alumno } from 'src/alumno/entities/alumno.entity';
import { UsersModule } from 'src/users/users.module';
import { AsistenciaModule } from 'src/asistencia/asistencia.module';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  controllers: [SeccionController],
  providers: [SeccionService],
  imports: [
    CommonModule,
    forwardRef(() => GradoModule), // Usar forwardRef si GradoModule depende de SeccionModule
    forwardRef(() => PublicacionModule), // Importar PublicacionModule para usar PublicacionRepository
    forwardRef(() => UsersModule), // Usar forwardRef si UsersModule depende de SeccionModule
    AsistenciaModule,
    TypeOrmModule.forFeature([Seccion, Grado, Alumno, Role]),
  ],
  exports: [TypeOrmModule, SeccionService], // Exportar SeccionService si es necesario
})
export class SeccionModule {}
