import { Test, TestingModule } from '@nestjs/testing';
import { RecomendadorService } from './recomendador.service';

describe('RecomendadorService', () => {
  let service: RecomendadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecomendadorService],
    }).compile();

    service = module.get<RecomendadorService>(RecomendadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
