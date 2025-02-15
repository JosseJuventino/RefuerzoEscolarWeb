import { Module, forwardRef } from '@nestjs/common';
import { PublicacionService } from './service/publicacion.service';
import { PublicacionController } from './controller/publicacion.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from './entities/publicacion.entity';
import { SeccionModule } from 'src/seccion/seccion.module';
import { RolesModule } from 'src/roles/roles.module';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { DocumentsModule } from 'src/document/document.module';
import { ImagesModule } from 'src/images/images.module';

@Module({
  controllers: [PublicacionController],
  providers: [PublicacionService],
  imports: [
    CommonModule,
    RolesModule,
    DocumentsModule, // Importar DocumentModule para usar DocumentRepository
    ImagesModule, // Importar ImageModule para usar ImageRepository
    TypeOrmModule.forFeature([Publicacion, Seccion]),
  ],
  exports: [TypeOrmModule, PublicacionService], // Exportar TypeOrmModule para que otros módulos puedan usar PublicacionRepository
})
export class PublicacionModule {}
