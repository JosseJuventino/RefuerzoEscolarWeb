import { Test, TestingModule } from '@nestjs/testing';
import { GradoController } from './grado.controller';
import { GradoService } from '../service/grado.service';

describe('GradoController', () => {
  let controller: GradoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradoController],
      providers: [GradoService],
    }).compile();

    controller = module.get<GradoController>(GradoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
