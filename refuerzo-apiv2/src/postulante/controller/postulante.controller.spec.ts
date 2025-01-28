import { Test, TestingModule } from '@nestjs/testing';
import { PostulanteController } from './postulante.controller';
import { PostulanteService } from '../service/postulante.service';

describe('PostulanteController', () => {
  let controller: PostulanteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostulanteController],
      providers: [PostulanteService],
    }).compile();

    controller = module.get<PostulanteController>(PostulanteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
