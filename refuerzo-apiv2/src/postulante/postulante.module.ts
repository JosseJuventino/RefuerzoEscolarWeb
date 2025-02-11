import { Module, forwardRef } from '@nestjs/common';
import { PostulanteService } from './service/postulante.service';
import { PostulanteController } from './controller/postulante.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulante } from './entities/postulante.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module'; // Importar UsersModule
import { Grado } from 'src/grado/entities/grado.entity';

@Module({
  controllers: [PostulanteController],
  providers: [PostulanteService],
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Postulante, User, Grado]),
    forwardRef(() => UsersModule), // Usar forwardRef
  ],
  exports: [TypeOrmModule, PostulanteService],
})
export class PostulanteModule {}
