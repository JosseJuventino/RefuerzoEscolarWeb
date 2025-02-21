import { Module, forwardRef } from '@nestjs/common';
import { GradoService } from './service/grado.service';
import { GradoController } from './controller/grado.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grado } from './entities/grado.entity';
import { SeccionModule } from 'src/seccion/seccion.module';

@Module({
  controllers: [GradoController],
  providers: [GradoService],
  imports: [
    CommonModule,
    forwardRef(() => SeccionModule),
    TypeOrmModule.forFeature([Grado]),
  ],
  exports: [TypeOrmModule, GradoService],
})
export class GradoModule {}
