import { Test, TestingModule } from '@nestjs/testing';
import { RecomendadorController } from './recomendador.controller';
import { RecomendadorService } from '../service/recomendador.service';

describe('RecomendadorController', () => {
  let controller: RecomendadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendadorController],
      providers: [RecomendadorService],
    }).compile();

    controller = module.get<RecomendadorController>(RecomendadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
