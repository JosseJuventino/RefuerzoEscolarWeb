import { Module } from '@nestjs/common';
import { GradoService } from './service/grado.service';
import { GradoController } from './controller/grado.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grado } from './entities/grado.entity';

@Module({
  controllers: [GradoController],
  providers: [GradoService],
  imports: [CommonModule, TypeOrmModule.forFeature([Grado])],
  exports: [TypeOrmModule],
})
export class GradoModule {}
