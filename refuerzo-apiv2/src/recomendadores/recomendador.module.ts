import { Module } from '@nestjs/common';
import { RecomendadorService } from './service/recomendador.service';
import { RecomendadorController } from './controller/recomendador.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendador } from './entities/recomendador.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module'; // Importar UsersModule

@Module({
  controllers: [RecomendadorController],
  providers: [RecomendadorService],
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([Recomendador, User]),
    UsersModule, // Importar UsersModule
  ],
  exports: [TypeOrmModule],
})
export class RecomendadorModule {}
