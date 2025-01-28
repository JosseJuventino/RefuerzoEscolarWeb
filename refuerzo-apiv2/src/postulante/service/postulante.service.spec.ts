import { Test, TestingModule } from '@nestjs/testing';
import { PostulanteService } from './postulante.service';

describe('PostulanteService', () => {
  let service: PostulanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostulanteService],
    }).compile();

    service = module.get<PostulanteService>(PostulanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
