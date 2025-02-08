import { Module } from '@nestjs/common';
import { ProgramaController } from './controller/programa.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './entities/programa.entity';
import { ProgramaService } from './service/programa.service';

@Module({
  controllers: [ProgramaController],
  providers: [ProgramaService],
  imports: [CommonModule, TypeOrmModule.forFeature([Programa])],
  exports: [TypeOrmModule],
})
export class ProgramaModule {}
