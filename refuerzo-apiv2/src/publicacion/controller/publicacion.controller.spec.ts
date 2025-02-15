import { Test, TestingModule } from '@nestjs/testing';
import { PublicacionController } from './publicacion.controller';
import { PublicacionService } from '../service/publicacion.service';

describe('PublicacionController', () => {
  let controller: PublicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicacionController],
      providers: [PublicacionService],
    }).compile();

    controller = module.get<PublicacionController>(PublicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
