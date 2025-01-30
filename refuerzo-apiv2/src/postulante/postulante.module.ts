import { Module } from '@nestjs/common';
import { PostulanteService } from './service/postulante.service';
import { PostulanteController } from './controller/postulante.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulante } from './entities/postulante.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [PostulanteController],
  providers: [PostulanteService],
  imports: [CommonModule, TypeOrmModule.forFeature([Postulante, User])],
  exports: [TypeOrmModule],
})
export class PostulanteModule {}
