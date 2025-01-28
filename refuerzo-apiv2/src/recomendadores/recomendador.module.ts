import { Module } from '@nestjs/common';
import { RecomendadorService } from './service/recomendador.service';
import { RecomendadorController } from './controller/recomendador.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendador } from './entities/recomendador.entity';

@Module({
  controllers: [RecomendadorController],
  providers: [RecomendadorService],
  imports: [CommonModule, TypeOrmModule.forFeature([Recomendador])],
  exports: [TypeOrmModule],
})
export class RecomendadorModule {}
