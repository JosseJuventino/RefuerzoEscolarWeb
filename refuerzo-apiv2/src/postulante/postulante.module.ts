import { Module } from '@nestjs/common';
import { PostulanteService } from './service/postulante.service';
import { PostulanteController } from './controller/postulante.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulante } from './entities/postulante.entity';

@Module({
  controllers: [PostulanteController],
  providers: [PostulanteService],
  imports: [CommonModule, TypeOrmModule.forFeature([Postulante])],
  exports: [TypeOrmModule],
})
export class PostulanteModule {}